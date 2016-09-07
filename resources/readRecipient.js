window.onload = function() {
    meta = document.querySelector('head meta[name="fambit-recipient"]');
    const message = {
        action: 'PAGE_LOAD'
    };

    if (meta !== null && meta.content !== undefined) {
        message.recipient = meta.content;
    }
    chrome.runtime.sendMessage(message);
};