document.addEventListener('DOMContentLoaded', function() {
    const meta = document.querySelector('head meta[name="fambit-recipient"]');

    let recipient = undefined;
    if (meta !== null) {
        recipient = meta.content;
    }

    chrome.runtime.sendMessage({
        action: 'PAGE_LOAD',
        recipient: recipient
    });
});