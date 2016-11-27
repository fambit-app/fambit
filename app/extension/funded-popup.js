const controller = require('../bitcoin/controller')();
const filter = require('./bitcoin-filter');

document.addEventListener('DOMContentLoaded', () => {
    const addressElement = document.getElementById('bitcoin-address');
    addressElement.innerHTML = controller.publicKey();
    controller.balance().then((balance) => {
        const amountElement = document.getElementById('pool-amount');
        amountElement.innerHTML = filter(balance);
    });

    chrome.runtime.sendMessage({
        action: 'FUNDED_POPUP_VIEWED'
    });
});