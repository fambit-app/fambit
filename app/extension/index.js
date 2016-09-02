const bitcoin = require('../bitcoin/bitcoin');

const bitcoinAddress = new bitcoin.BitcoinAddress(
    (key, value) => console.log(`SAVE [${key}:${value}]`),
    (key) => console.log(`GET  [${key}]`)
);
const pair = bitcoinAddress.createAddress();
window.onload = function () {
    document.getElementById('wif').textContent = pair.toWIF();
    document.getElementById('address').textContent = pair.getAddress();
};