const bitcoin = require('../bitcoin/bitcoin');

const address = bitcoin.BitcoinAddress.createAddress();
window.onload = function () {
    console.log(address);
    document.getElementById('private-key').textContent = 'private-key';
    document.getElementById('public-key').textContent = 'public-key';
    document.getElementById('recv-address').textContent = 'recv-address';
};
