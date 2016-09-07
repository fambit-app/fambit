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