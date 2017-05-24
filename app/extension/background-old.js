const raven = require('../raven');
const init = require('../init');
const {tryRetrieve, retrieveMulti, save} = require('../storage');

const TRANSACTION_DELAY_MINUTES = 10080; // 1 week = 60 minutes * 24 hours * 7 days
raven.start(retrieve);

if (init.isFirstStart(tryRetrieve())) {
    init.prepare(save);
}

let runtime;
if (typeof browser === 'undefined') {
    runtime = chrome;
} else {
    runtime = browser;
}

if (localStorage.getItem('onboard-status') === null) { // First install
    localStorage.setItem('onboard-status', 'NO_BITCOIN');
    runtime.alarms.create('SUBMIT_TRANSACTION', {
        periodInMinutes: TRANSACTION_DELAY_MINUTES
    });
}

runtime.storage.sync.get('banned-domains', (res) => {
    localStorage.setItem('banned-domains', JSON.stringify(res['banned-domains'] || []));
});

function currentTabDonated() {
    return new Promise((resolve) => {
        chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
            const history = JSON.parse(localStorage.getItem('page-views') || '[]');
            const lastDonation = history.filter((donation) => donation.url === tabs[0].url)[0];
            resolve(lastDonation && lastDonation.amount);
        });
    });
}

function setIcon(type = 'normal') {
    const modifier = type === 'normal' ? '' : `${type}-`;

    runtime.browserAction.setIcon({
        path: {
            '16': `icon-${modifier}16.png`,
            '19': `icon-${modifier}19.png`,
            '24': `icon-${modifier}24.png`
        }
    });
}

runtime.storage.sync.get(['donation-percentage', 'report-errors'], (res) => {
    const donationPercentage = res['donation-percentage'];

    runtime.storage.onChanged.addListener((changes) => {
        if (changes['donation-percentage']) {
            controller.updateDonationPercentage(changes['donation-percentage'].newValue);
        }
        if (changes['banned-domains']) {
            localStorage.setItem('banned-domains', JSON.stringify(changes['banned-domains'].newValue));
        }
        if (changes['report-errors']) {
            localStorage.setItem('report-errors', changes['report-errors'].newValue);
            if (changes['report-errors'].newValue) {
                controller.startRaven();
            } else {
                controller.stopRaven();
            }
        }
    });

    function updatePopup(onboardStatus) {
        function checkFunded(newBalance) {
            if (!newBalance || newBalance <= 0 || localStorage.getItem('onboard-status') !== 'NO_BITCOIN') {
                return;
            }

            localStorage.setItem('onboard-status', 'FUNDED');
            updatePopup('FUNDED');
        }

        if (onboardStatus === 'NO_BITCOIN') {
            runtime.browserAction.setPopup({
                popup: 'onboard-popup.html'
            });
            setIcon('normal');

            controller.balance().then(checkFunded);
            controller.liveBalance((newBalance) => {
                console.log('balance changed', newBalance);
                checkFunded(newBalance);
            });
        } else if (onboardStatus === 'FUNDED') {
            runtime.browserAction.setPopup({
                popup: 'funded-popup.html'
            });
            setIcon('alert');
        } else if (onboardStatus === 'DONE') {
            runtime.browserAction.setPopup({
                popup: 'main-popup.html'
            });
            setIcon('normal');
        }
    }

    updatePopup(localStorage.getItem('onboard-status'));

    runtime.runtime.onMessage.addListener((request) => {
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
                runtime.browserAction.setPopup({
                    popup: 'main-popup.html'
                });
            }

            currentTabDonated().then((donated) => setIcon(donated ? 'donated' : 'normal'));
        }
    });

    runtime.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name !== 'SUBMIT_TRANSACTION') {
            return;
        }

        console.log('Submitting transactions');
        controller.commitTransaction();
    });

    // When the user changes to an already-opened tab, check history for if page did receive a donation when
    // it was originally opened, and update icon accordingly
    runtime.tabs.onActivated.addListener(() => {
        const onboardStatus = localStorage.getItem('onboard-status');
        if (onboardStatus === 'FUNDED' && !localStorage.getItem('viewed-funded-popup')) {
            // Fambit has received bitcoin, but the user hasn't viewed the "funded" popup. Show the "!" icon
            setIcon('alert');
            return;
        }

        currentTabDonated().then((donated) => setIcon(donated ? 'donated' : 'normal'));
    });
});