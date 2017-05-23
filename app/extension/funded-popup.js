const raven = require('../raven');
const format = require('./bitcoin-format');
const balance = require('../bitcoin/bitcoin-balance');
const {retrieveLocal, retrieve, saveLocal} = require('../storage');

raven.start(retrieve);
document.addEventListener('DOMContentLoaded', () => {
    const amountContainer = document.getElementsByClassName('amount')[0];
    const addressElement = document.getElementById('bitcoin-address');
    const amountElement = document.getElementById('pool-amount');

    retrieve('public-key').then((publicKey) => addressElement.innerHTML = publicKey);
    balance(retrieveLocal, retrieve, saveLocal)
        .then((bitcoin) => {
            amountContainer.classList.remove('error');
            amountElement.innerHTML = format(bitcoin);
        })
        .catch(() => {
            const reportLink = document.createElement('a');
            reportLink.href = 'https://github.com/fambit-app/fambit/issues';
            reportLink.target = '_blank';
            reportLink.innerHTML = 'Report this bug!';
            amountContainer.classList.add('error');
            amountElement.innerHTML = 'Unknown balance. ';
            amountElement.appendChild(reportLink);
        });

    chrome.runtime.sendMessage({
        action: 'FUNDED_POPUP_VIEWED'
    });
});