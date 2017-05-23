const raven = require('../raven');
const {retrieve} = require('../storage');

raven.start(retrieve);
document.addEventListener('DOMContentLoaded', () => {
    const addressElement = document.querySelector('.bitcoin-address');
    retrieve('public-key').then((publicKey) => addressElement.innerHTML = publicKey);

    chrome.runtime.onMessage.addListener((e) => {
        if (e.action === 'RECEIVED_BITCOIN') {
            window.location.href = 'funded-popup.html';
        }
    });
});