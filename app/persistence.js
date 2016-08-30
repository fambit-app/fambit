const PRIVATE_KEY = 'fambit-private-key';
const PUBLIC_KEY = 'fambit-public-key';

function hasBitcoinAddress() {
    return parent.localStorage.hasOwnProperty(PRIVATE_KEY) &&
        parent.localStorage.hasOwnProperty(PUBLIC_KEY);
}

function addAddress(keyPair) {
    parent.localStorage.setItem(PRIVATE_KEY, keyPair.toWIF());
    parent.localStorage.setItem(PUBLIC_KEY, keyPair.getAddress());
}

function getPrivateKey() {
    return parent.localStorage.getItem(PRIVATE_KEY);
}

function getPublicKey() {
    return parent.localStorage.getItem(PUBLIC_KEY);
}

module.exports = { hasBitcoinAddress, addAddress, getPrivateKey, getPublicKey };
