const controller = require('../bitcoin/controller')();
const format = require('./bitcoin-format');

document.addEventListener('DOMContentLoaded', () => {
    const amountContainer = document.getElementsByClassName('amount')[0];
    const addressElement = document.getElementById('bitcoin-address');
    addressElement.innerHTML = controller.publicKey();
    controller.balance().then((balance) => {
        const amountElement = document.getElementById('pool-amount');
        if (balance === undefined) {
            const reportLink = document.createElement('a');
            reportLink.href = 'https://github.com/fambit-app/fambit/issues';
            reportLink.target = '_blank';
            reportLink.innerHTML = 'Report this bug!';
            amountContainer.classList.add('error');
            amountElement.innerHTML = 'Unknown balance. ';
            amountElement.appendChild(reportLink);
        } else {
            amountContainer.classList.remove('error');
            amountElement.innerHTML = format(balance);
        }
    });

    chrome.runtime.sendMessage({
        action: 'FUNDED_POPUP_VIEWED'
    });
});