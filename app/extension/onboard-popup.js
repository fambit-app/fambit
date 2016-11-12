const address = require('../bitcoin/address');

document.addEventListener('DOMContentLoaded', () => {
    const addressText = document.querySelector('.bitcoin-address');
    addressText.innerHTML = address.fromStorage(localStorage.getItem.bind(localStorage).publicKey);
});