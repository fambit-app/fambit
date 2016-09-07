const TRANSACTION_DELAY_MINUTES = 10080; // 1 week = 60 minutes * 24 hours * 7 days

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