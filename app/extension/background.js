const raven = require('../raven');
const init = require('../init');
const pending = require('../bitcoin/pending-donations');
const http = require('../bitcoin/blockchain-http');
const ws = require('../bitcoin/blockchain-websocket');
const balance = require('../bitcoin/bitcoin-balance');
const transaction = require('../bitcoin/bitcoin-transaction');
const {retrieve, retrieveMulti, retrieveLocal, save, saveLocal, saveMulti} = require('../storage');

raven.start(retrieve);
init.prepare(retrieve, saveLocal, saveMulti);

function setIcon(type = 'normal') {
    const modifier = type === 'normal' ? '' : `${type}-`;

    chrome.browserAction.setIcon({
        path: {
            '16': `icon-${modifier}16.png`,
            '19': `icon-${modifier}19.png`,
            '24': `icon-${modifier}24.png`
        }
    });
}

function hasTabDonated() {
    return new Promise((resolve) => {
        chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
            const history = JSON.parse(localStorage.getItem('page-views') || '[]');
            const lastDonation = history.filter((donation) => donation.url === tabs[0].url)[0];
            resolve(lastDonation && lastDonation.amount);
        });
    });
}

// When the user changes to an already-opened tab, check history for if page did receive a donation when
// it was originally opened, and update icon accordingly
chrome.tabs.onActivated.addListener(() => {
    const onboardStatus = localStorage.getItem('onboard-status');
    if (onboardStatus === 'FUNDED' && !localStorage.getItem('viewed-funded-popup')) {
        // Fambit has received bitcoin, but the user hasn't viewed the "funded" popup. Show the "!" icon
        setIcon('alert');
        return;
    }

    hasTabDonated().then((donated) => setIcon(donated ? 'donated' : 'normal'));
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name !== 'SUBMIT_TRANSACTION') {
        return;
    }

    console.log('Submitting transactions');
    const donations = pending.commit(retrieveLocal, saveLocal);
    retrieveMulti(['private-key', 'public-key']).then((res) => {
        const privateKey = res['private-key'];
        const publicKey = res['public-key'];
        const hash = transaction(privateKey, publicKey, donations, http);
        http.submitTransaction(hash);
    });
});

retrieveMulti(['public-key', 'donation-percentage', 'report-errors', 'onboard-status']).then((res) => {
    function updatePopup(onboardStatus) {
        if (onboardStatus === 'NO_BITCOIN') {
            setIcon('normal');
            chrome.browserAction.setPopup({
                popup: 'onboard-popup.html'
            });

            balance(retrieveLocal, retrieve, saveLocal).then((b) => {
                if (b > 0) {
                    save('onboard-status', 'FUNDED');
                    updatePopup('FUNDED');
                }
            });

            const wsClose = ws.listen(http, res['public-key'], (b) => {
                if (b > 0) {
                    save('onboard-status', 'FUNDED');
                    updatePopup('FUNDED');
                    wsClose();
                }
            });
        } else if (onboardStatus === 'FUNDED') {
            setIcon('alert');
            chrome.browserAction.setPopup({
                popup: 'funded-popup.html'
            });
        } else if (onboardStatus === 'DONE') {
            setIcon('normal');
            chrome.browserAction.setPopup({
                popup: 'main-popup.html'
            });
        }
    }

    updatePopup(res['onboard-status']);
    let donationPercentage = res['donation-percentage'];

    chrome.storage.onChanged.addListener((changes) => {
        if (changes['donation-percentage']) {
            controller.updateDonationPercentage(changes['donation-percentage'].newValue);
            donationPercentage = changes['donation-percentage]'].newValue;
        }
        if (changes['report-errors']) {
            if (changes['report-errors'].newValue) {
                raven.start(retrieve);
            } else {
                raven.stop(retrieve);
            }
        }
    });

    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === 'PAGE_LOAD') {
            const onboardStatus = localStorage.getItem('onboard-status');
            if (onboardStatus === 'NO_BITCOIN') {
                return; // Don't donate if have no bitcoin yet
            }

            controller.donate(request).then((donation) => {
                const pageDonation = {
                    recipient: request.recipient,
                    url: request.url,
                    domain: request.domain,
                    date: donation.date,
                    amount: donation.amount,
                    reason: donation.reason,
                };

                const pageHistory = JSON.parse(localStorage.getItem('page-views') || '[]');
                pageHistory.unshift(pageDonation);
                localStorage.setItem('page-views', JSON.stringify(pageHistory));

                // To go from "FUNDED" to done, the user needs to both
                // 1. View "funded" popup
                // 2. Visit a fambit-supported page
                if (onboardStatus === 'FUNDED' && localStorage.getItem('viewed-funded-popup')) {
                    localStorage.setItem('onboard-status', 'DONE');
                    updatePopup('DONE');
                }

                // If the user hasn't viewed the "funded" popup yet, don't change the icon from the "!" icon
                if (onboardStatus === 'FUNDED' && !localStorage.getItem('viewed-funded-popup')) {
                    return;
                }

                // If a donation was sent, update icon to show that a donation was received
                chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
                    // ... but only if we're still on the same page by the time it loaded
                    if (tabs[0].url !== pageDonation.url) {
                        return;
                    }

                    if (pageDonation.amount) {
                        setIcon('donated');
                    } else {
                        setIcon('normal');
                    }
                });
            });
        } else if (request.action === 'FUNDED_POPUP_VIEWED') {
            localStorage.setItem('viewed-funded-popup', true);
            if (localStorage.getItem('page-views') !== null) {
                localStorage.setItem('onboard-status', 'DONE');
                chrome.browserAction.setPopup({
                    popup: 'main-popup.html'
                });
            }

            hasTabDonated().then((donated) => setIcon(donated ? 'donated' : 'normal'));
        }
    });
});