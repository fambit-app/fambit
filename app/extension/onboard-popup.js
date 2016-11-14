const controller = require('../bitcoin/controller')();

document.addEventListener('DOMContentLoaded', () => {
    const addressText = document.querySelector('.bitcoin-address');
    addressText.innerHTML = controller.publicKey();
});