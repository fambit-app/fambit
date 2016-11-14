window.onload = function() {
    const meta = document.querySelector('head meta[name="fambit-recipient"]');

    if (meta === null || meta.content === undefined) {
        return;
    }

    chrome.runtime.sendMessage({
        action: 'PAGE_LOAD',
        recipient: meta.content
    });
};