const meta = document.querySelector('head meta[name="bitcoin-recipient"]');

let recipient = undefined;
if (meta !== null) {
    recipient = meta.content;
}

chrome.runtime.sendMessage({
    action: 'PAGE_LOAD',
    recipient: recipient,
    url: window.location.href,
    domain: window.location.hostname
});