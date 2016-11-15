document.addEventListener('DOMContentLoaded', function() {
    console.log('what up')
    const meta = document.querySelector('head meta[name="fambit-recipient"]');

    let recipient = undefined;
    if (meta !== null) {
        recipient = meta.content;
    }
    console.log('oy', recipient);

    chrome.runtime.sendMessage({
        action: 'PAGE_LOAD',
        recipient: recipient
    });
});