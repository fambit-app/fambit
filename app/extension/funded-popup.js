const controller = require('../bitcoin/controller')();

document.addEventListener('DOMContentLoaded', () => {
    const balance = controller.balance();
    console.log(balance);
    const amountElement = document.getElementById('pool-amount');
    amountElement.innerHTML = `${balance} mBTC`;

    document.getElementById('funded-ok').addEventListener('click', () => {
        localStorage.setItem('onboard-status', 'DONE');
        window.location.href = 'main-popup.html';
    });
});