const address = require('../bitcoin/address');
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
    if (onboardStatus === 'NO_BITCOIN') {
        runtime.browserAction.setPopup({
            popup: 'onboard-popup.html'
        });
        runtime.browserAction.setIcon({
            path: 'icon-16.png'
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
            path: 'icon-alert-16.png'
        });
    } else if (onboardStatus === 'DONE') {
        runtime.browserAction.setPopup({
            popup: 'main-popup.html'
        });
        runtime.browserAction.setIcon({
            path: 'icon-16.png'
        });
    }
}

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

runtime.runtime.onMessage.addListener((request) => {
    if (request.action === 'PAGE_LOAD') {
        const onboardStatus = localStorage.getItem('onboard-status');
        if (onboardStatus === 'NO_BITCOIN') {
            return; // Don't add to fambit history if have no bitcoin yet
        }

        let promise;
        if (request.recipient) {
            promise = controller.donate(request.recipient);
        } else {
            promise = Promise.resolve();
        }

        promise.then((donation) => {
            const pageDonation = {
                url: request.url,
                domain: request.domain,
                date: Date.now()
            };

            if (donation) {
                pageDonation.amount = donation.amount;
                pageDonation.recipient = donation.recipient;
                pageDonation.date = donation.date;
            }

            const pageHistory = JSON.parse(localStorage.getItem('page-donations') || '[]');
            pageHistory.unshift(pageDonation);
            localStorage.setItem('page-donations', JSON.stringify(pageHistory));

            if (onboardStatus !== 'DONE' && localStorage.getItem('viewed-funded-popup')) {
                localStorage.setItem('onboard-status', 'DONE');
                updatePopup('DONE');
            }
        });
    } else if (request.action === 'FUNDED_POPUP_VIEWED') {
        localStorage.setItem('viewed-funded-popup', true);
        runtime.browserAction.setIcon({
            path: 'icon-16.png'
        });

        if (localStorage.getItem('page-donations') !== null) {
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