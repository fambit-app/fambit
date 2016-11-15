const bitcoinJS = require('bitcoinjs-lib');

const PRIVATE_KEY = 'private-key';
const PUBLIC_KEY = 'public-key';

function fromStorage(retrieve) {
    const privateKey = retrieve(PRIVATE_KEY);
    const publicKey = retrieve(PUBLIC_KEY);
    console.log(privateKey, publicKey);
    console.trace();
    if (!privateKey || !publicKey) {
        return undefined;
    }

    return {privateKey, publicKey};
}

function generate(save) {
    const keyPair = bitcoinJS.ECPair.makeRandom();
    const privateKey = keyPair.toWIF();
    const publicKey = keyPair.getAddress();

    save(PRIVATE_KEY, privateKey);
    save(PUBLIC_KEY, publicKey);
    return {privateKey, publicKey};
}

module.exports = {fromStorage, generate};