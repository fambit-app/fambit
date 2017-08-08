const raven = require('../raven');
const init = require('../init');
const pending = require('../bitcoin/pending-donations');
const http = require('../bitcoin/blockchain-http');
const ws = require('../bitcoin/blockchain-websocket');
const createDonation = require('../create-donation');
const balance = require('../bitcoin/bitcoin-balance');
const transaction = require('../bitcoin/bitcoin-transaction');
const {setIcon, setPopup} = require('./browser-actions');
const {isStoredLocally, retrieve, retrieveMulti, retrieveLocal, save, saveLocal, saveMulti} = require('../storage');

function hasTabDonated() {
    return new Promise((resolve) => {
        chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
            const history = retrieveLocal('page-views');
            const lastDonation = history.filter(donation => donation.url === tabs[0].url)[0];
            resolve(lastDonation && lastDonation.amount);
        });
    });
}

init(retrieveMulti, isStoredLocally, saveMulti, saveLocal, [
    'private-key',
    'public-key',
    'onboard-status',
    'banned-domains',
    'donation-percentage',
    'report-errors'
], () => import(/* webpackChunkName "bitcoinJS" */ 'bitcoinjs-lib').then((bitcoinJS) => {
    const keyPair = bitcoinJS.ECPair.makeRandom();

    return {
        'private-key': keyPair.toWIF(),
        'public-key': keyPair.getAddress(),
        'onboard-status': 'NO_BITCOIN',
        'banned-domains': [],
        'donation-percentage': 0.01, // 0.01% of the existing pool will be used for each donation
        'report-errors': false
    };
})).then((res) => {
    const privateKey = res['private-key'];
    const publicKey = res['public-key'];
    let onboardStatus = res['onboard-status'];
    let bannedDomains = res['banned-domains'];
    let donationPercentage = res['donation-percentage'];

    if (res['report-errors']) {
        raven.start();
    } else {
        raven.stop();
    }

    if (onboardStatus === 'NO_BITCOIN') {
        setIcon('normal');
        chrome.browserAction.setPopup({
            popup: 'onboard-popup.html'
        });

        balance(isStoredLocally, retrieveLocal, retrieve, saveLocal).then((b) => {
            if (b > 0) {
                save('onboard-status', 'FUNDED');
            } else {
                const wsClose = ws.listen(http, publicKey, (bal) => {
                    if (bal > 0) {
                        save('onboard-status', 'FUNDED');
                        wsClose();
                    }
                });
            }
        });
    }

    chrome.storage.onChanged.addListener((changes) => {
        if (changes['onboard-status']) {
            onboardStatus = changes['onboard-status'].newValue;
            console.log('Updated "onboard-status" to ', onboardStatus);
            if (onboardStatus === 'FUNDED') {
                setIcon('alert');
                setPopup('funded-popup.html');
            } else if (onboardStatus === 'DONE') {
                setIcon('normal');
                setPopup('main-popup.html');
            }
        }
        if (changes['banned-domains']) {
            bannedDomains = changes['banned-domains'].newValue;
            console.log('Updated "banned-domains" to ', bannedDomains);
        }
        if (changes['donation-percentage']) {
            donationPercentage = changes['donation-percentage'].newValue;
            console.log('Updated "donation-percentage" to ', donationPercentage);
        }
        if (changes['report-errors']) {
            if (changes['report-errors'].newValue) {
                raven.start();
            } else {
                raven.stop();
            }
        }
    });

    // When the user changes to an already-opened tab, check history for if page did receive a donation when
    // it was originally opened, and update icon accordingly
    chrome.tabs.onActivated.addListener(() => {
        if (onboardStatus === 'FUNDED' && !retrieveLocal('viewed-funded-popup')) {
            // Fambit has received bitcoin, but the user hasn't viewed the "funded" popup. Show the "!" icon
            setIcon('alert');
            return;
        }

        hasTabDonated().then(donated => setIcon(donated ? 'donated' : 'normal'));
    });

    chrome.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name !== 'SUBMIT_TRANSACTION') {
            return;
        }

        console.log('Submitting transactions');
        const donations = pending.commit(retrieveLocal, saveLocal);
        transaction(privateKey, publicKey, donations, http).then(hash => http.submitTransaction(hash));
    });

    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === 'PAGE_LOAD') {
            if (onboardStatus === 'NO_BITCOIN') {
                return; // Don't donate if have no bitcoin yet
            }

            createDonation(isStoredLocally, retrieveLocal, retrieve, saveLocal, balance, donationPercentage,
                bannedDomains, pending, request)
                .then((donation) => {
                    const pageDonation = {
                        recipient: request.recipient,
                        url: request.url,
                        domain: request.domain,
                        date: donation.date,
                        amount: donation.amount,
                        reason: donation.reason,
                    };

                    const viewedFundedPopup = retrieveLocal('viewed-funded-popup');
                    const pageHistory = retrieveLocal('page-views');
                    pageHistory.unshift(pageDonation);
                    saveLocal('page-views', pageHistory);

                    if (onboardStatus === 'FUNDED') {
                        // To go from "FUNDED" to done, the user needs to both
                        // 1. View "funded" popup
                        // 2. Visit a fambit-supported page
                        if (viewedFundedPopup) {
                            save('onboard-status', 'DONE');
                        } else {
                            // If the user hasn't viewed the "funded" popup yet, don't change the icon from the "!" icon
                            return;
                        }
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
            saveLocal('viewed-funded-popup', true);
            if (retrieveLocal('page-views').length > 0) {
                // If both viewed the popup and have visited a fambit-supported page, finish onboarding
                save('onboard-status', 'DONE');
            }

            hasTabDonated().then(donated => setIcon(donated ? 'donated' : 'normal'));
        }
    });
});