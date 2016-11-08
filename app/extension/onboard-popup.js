const bitcoin = require('../bitcoin/bitcoin');
const BitcoinPersistence = require('../bitcoin/persistence');

const bitcoinPersistence = new BitcoinPersistence();
const address = new bitcoin.BitcoinAddress(bitcoinPersistence);

document.addEventListener('DOMContentLoaded', () => {
    const addressText = document.querySelector('.bitcoin-address');
    addressText.innerHTML = address.getPublicKey();
});