const address = require('../bitcoin/address');
const controller = require('../bitcoin/controller')();

const TRANSACTION_DELAY_MINUTES = 10080; // 1 week = 60 minutes * 24 hours * 7 days

function updatePopup(onboardStatus) {
    if (onboardStatus === 'NO_BITCOIN') {
        chrome.browserAction.setPopup({
            popup: 'onboard-popup.html'
        });
        chrome.browserAction.setIcon({
            path: 'icon-16.png'
        });
    } else if (onboardStatus === 'FUNDED') {
        chrome.browserAction.setPopup({
            popup: 'funded-popup.html'
        });
        chrome.browserAction.setIcon({
            path: 'icon-alert-16.png'
        });
    } else if (onboardStatus === 'DONE') {
        chrome.browserAction.setPopup({
            popup: 'main-popup.html'
        });
        chrome.browserAction.setIcon({
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
    chrome.runtime.sendMessage({
        action: 'RECEIVED_BITCOIN'
    });
}

chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'PAGE_LOAD') {
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

            localStorage.setItem('last-page-donation', JSON.stringify(pageDonation));
            const pageHistory = JSON.parse(localStorage.getItem('page-donations') || '[]');
            pageHistory.push(pageDonation);
            localStorage.setItem('page-donations', JSON.stringify(pageHistory));
        });
    } else if (request.action === 'ONBOARD_COMPLETED') {
        localStorage.setItem('onboard-status', 'DONE');
        updatePopup('DONE');
        chrome.browserAction.setIcon({
            path: 'icon-16.png'
        });
    }
});

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason !== 'install') {
        return;
    }

    // Installation initialization
    address.generate(localStorage.setItem.bind(localStorage));
    localStorage.setItem('onboard-status', 'NO_BITCOIN');
    chrome.alarms.create('SUBMIT_TRANSACTION', {
        periodInMinutes: TRANSACTION_DELAY_MINUTES
    });
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name !== 'SUBMIT_TRANSACTION') {
        return;
    }

    console.log('Submitting transactions');
});

const onboardStatus = localStorage.getItem('onboard-status');
if (onboardStatus !== null) { // Will be null if this is first install, and `onInstalled` hasn't been executed yet
    updatePopup(localStorage.getItem('onboard-status'));
    controller.liveBalance((newBalance) => {
        checkFunded(newBalance);
    });
}