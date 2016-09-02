import test from 'ava';
const bitcoin = require('../app/bitcoin/bitcoin.js');
const persistence = require('./mock_persistence.js');

test('bitcoinjs-lib should generate the same public key from a given private key', t => {
    const bitcoinAddress = new bitcoin.BitcoinAddress(persistence);

    t.is(bitcoinAddress._hasBitcoinAddress(), false);
    const keyPair = bitcoinAddress.createAddress();
    t.is(bitcoinAddress._hasBitcoinAddress(), true);

    t.is(keyPair.getAddress(), bitcoinAddress.getKeyPair().getAddress());
});