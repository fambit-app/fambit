const bitcoin = require('../bitcoin/bitcoin');

const bitcoinAddress = new bitcoin.BitcoinAddress();
const bork = bitcoinAddress.createAddress();
console.log(bork);
window.onload = function () {
    document.getElementById('private-key').textContent = 'private-key';
    document.getElementById('public-key').textContent = 'public-key';
    document.getElementById('recv-address').textContent = 'recv-address';
};
