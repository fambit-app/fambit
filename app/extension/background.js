const controller = require('../bitcoin/controller')();

const TRANSACTION_DELAY_MINUTES = 10080; // 1 week = 60 minutes * 24 hours * 7 days

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

function updatePopup(onboardStatus) {
    function checkFunded(newBalance) {
        if (newBalance <= 0 || localStorage.getItem('onboard-status') !== 'NO_BITCOIN') {
            return;
        }

        localStorage.setItem('onboard-status', 'FUNDED');
        updatePopup('FUNDED');
        runtime.runtime.sendMessage({
            action: 'RECEIVED_BITCOIN'
        });
    }

    if (onboardStatus === 'NO_BITCOIN') {
        runtime.browserAction.setPopup({
            popup: 'onboard-popup.html'
        });
        runtime.browserAction.setIcon({
            path: {
                '16': 'icon-16.png',
                '19': 'icon-19.png',
                '24': 'icon-24.png'
            }
        });

        controller.balance().then(checkFunded);
        controller.liveBalance((newBalance) => {
            console.log('balance changed', newBalance);
            checkFunded(newBalance);
        });
    } else if (onboardStatus === 'FUNDED') {
        runtime.browserAction.setPopup({
            popup: 'funded-popup.html'
        });
        runtime.browserAction.setIcon({
            path: {
                '16': 'icon-alert-16.png',
                '19': 'icon-alert-19.png',
                '24': 'icon-alert-24.png'
            }
        });
    } else if (onboardStatus === 'DONE') {
        runtime.browserAction.setPopup({
            popup: 'main-popup.html'
        });
        runtime.browserAction.setIcon({
            path: {
                '16': 'icon-16.png',
                '19': 'icon-19.png',
                '24': 'icon-24.png'
            }
        });
    }
}

runtime.runtime.onMessage.addListener((request) => {
    if (request.action === 'PAGE_LOAD') {
        const onboardStatus = localStorage.getItem('onboard-status');
        if (onboardStatus === 'NO_BITCOIN') {
            return; // Don't add to fambit history if have no bitcoin yet
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

            if (onboardStatus !== 'DONE' && localStorage.getItem('viewed-funded-popup')) {
                localStorage.setItem('onboard-status', 'DONE');
                updatePopup('DONE');
            }
        });
    } else if (request.action === 'FUNDED_POPUP_VIEWED') {
        localStorage.setItem('viewed-funded-popup', true);
        runtime.browserAction.setIcon({
            path: {
                '16': 'icon-16.png',
                '19': 'icon-19.png',
                '24': 'icon-24.png'
            }
        });

        if (localStorage.getItem('page-views') !== null) {
            localStorage.setItem('onboard-status', 'DONE');
            updatePopup('DONE');
        }
    }
});

runtime.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name !== 'SUBMIT_TRANSACTION') {
        return;
    }

    console.log('Submitting transactions');
    controller.commitTransaction();
});

updatePopup(localStorage.getItem('onboard-status'));