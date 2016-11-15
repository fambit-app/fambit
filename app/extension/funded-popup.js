const controller = require('../bitcoin/controller')();

document.addEventListener('DOMContentLoaded', () => {
    controller.balance().then((balance) => {
        const amountElement = document.getElementById('pool-amount');
        amountElement.innerHTML = `${balance} mBTC`;
    });

    document.getElementById('funded-ok').addEventListener('click', () => {
        window.location.href = 'main-popup.html';
        chrome.runtime.sendMessage({
            action: 'ONBOARD_COMPLETED'
        });
    });
});