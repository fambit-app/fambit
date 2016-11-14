const controller = require('../bitcoin/controller')();

document.addEventListener('DOMContentLoaded', () => {
    const addressText = document.querySelector('.bitcoin-address');
    addressText.innerHTML = controller.publicKey();

    chrome.runtime.onMessage.addListener((e) => {
        if (e.action === 'RECEIVED_BITCOIN') {
            window.location.href = 'funded-popup.html';
        }
    });
});