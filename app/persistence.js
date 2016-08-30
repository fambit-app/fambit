var PRIVATE_KEY = "fambit-private-key";
var PUBLIC_KEY = "fambit-public-key";

function hasBitcoinAddress() {
    return localStorage.hasOwnProperty(PRIVATE_KEY) &&
        localStorage.hasOwnProperty(PUBLIC_KEY);
}

function addAddress(keyPair) {
    localStorage.setItem(PRIVATE_KEY, keyPair.toWIF());
    localStorage.setItem(PUBLIC_KEY, keyPair.getAddress());
}

function getPrivateKey() {
    return localStorage.getItem(PRIVATE_KEY);
}

function getPublicKey() {
    return localStorage.getItem(PUBLIC_KEY);
}

module.exports = {hasBitcoinAddress, addAddress, getPrivateKey, getPublicKey};