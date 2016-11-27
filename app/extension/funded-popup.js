const controller = require('../bitcoin/controller')();

document.addEventListener('DOMContentLoaded', () => {
    controller.balance().then((balance) => {
        const amountElement = document.getElementById('pool-amount');
        amountElement.innerHTML = `${Math.round(balance / 100)} μBTC`;
    });

    chrome.runtime.sendMessage({
        action: 'FUNDED_POPUP_VIEWED'
    });
});