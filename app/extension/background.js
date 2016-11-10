const bitcoin = require('../bitcoin/bitcoin');
const BitcoinPersistence = require('../bitcoin/persistence');

const TRANSACTION_DELAY_MINUTES = 10080; // 1 week = 60 minutes * 24 hours * 7 days
const bitcoinPersistence = new BitcoinPersistence();
const address = new bitcoin.BitcoinAddress(bitcoinPersistence);

const onboardStatus = localStorage.getItem('onboard-status');
if (onboardStatus === 'ONBOARD') {
    chrome.browserAction.setPopup({
        popup: 'onboard-popup.html'
    });
} else if (onboardStatus === 'FUNDED') {
    chrome.browserAction.setPopup({
        popup: 'funded-popup.html'
    });
} else if (onboardStatus === 'DONE') {
    chrome.browserAction.setPopup({
        popup: 'main-popup.html'
    });
}

chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'PAGE_LOAD') {
        // Handle recipient from last page
        const recipient = localStorage.getItem('recipient');
        if (recipient !== null) {
            console.log(`donating to: ${recipient}`);
            localStorage.removeItem('recipient');
        }

        // Store recipient from current page. Don't donate until next page load, so user has time to revoke donation
        if (request.recipient !== undefined) {
            localStorage.setItem('recipient', request.recipient);
        }
    }
});

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason !== 'install') {
        return;
    }

    // Installation initialization
    address.createAddress();
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