import test from 'ava';
const persistence = require('./mock_persistence.js');
const bitcoin = require('bitcoinjs-lib').ECPair;

test('Ensure generated keypair can be retrieved', t => {
    const keyPair = bitcoin.makeRandom();
    persistence.setAddress(keyPair);

    t.is(keyPair.getAddress(), persistence.getPublicKey());
    t.is(keyPair.toWIF(), persistence.getPrivateKey());

    persistence.reset();
});
