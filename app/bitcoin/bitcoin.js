const bitcoin = require('bitcoinjs-lib');
const BitcoinServerRequest = require('./servers');

class BitcoinAddress {
    constructor(persistence) {
        this.persistence = persistence;
        this.serverRequests = new BitcoinServerRequest();
    }

    createAddress() {
        if (this._hasBitcoinAddress()) return false;

        const keyPair = this._generateKeyPair();

        this.persistence.setAddress(keyPair);

        return keyPair;
    }

    getPublicKey() {
        return this.persistence.getPublicKey();
    }

    getPrivateKey() {
        return this.persistence.getPrivateKey();
    }
    
    getKeyPair() {
        return bitcoin.ECPair.fromWIF(this.persistence.getPrivateKey());
    }

    _generateKeyPair() {
        return bitcoin.ECPair.makeRandom();
    }

    _hasBitcoinAddress() {
        return this.persistence.hasBitcoinAddress();
    }

    checkBalance() {
        const address = this.persistence.getPublicKey();
        return this.serverRequests.getBalance(address);
    }
}

class BitcoinTransfer {

    //TODO: Allow #buildTransaction() to take a list of sources
    /**
     * Sends an amount of bitcoin to the destination wallet
     * @param sourcetx  - The transaction to use as a source for this transaction
     * @param sourceIndex   - The index of the source output in its transaction
     * @param to        - Public key of the recipient's bitcoin wallet
     * @param from      - Private key of the sender's bitcoin wallet
     * @param amount    - Amount of bitcoin to buildTransaction (in Satoshi)
     */
    static buildTransaction(sourcetx, sourceIndex, from, to, amount) {
        const transaction = new bitcoin.TransactionBuilder();

        transaction.addInput(sourcetx, sourceIndex);
        transaction.addOutput(to, parseInt(amount));

        const privateKey = bitcoin.ECPair.fromWIF(from);
        transaction.sign(0, privateKey);

        return transaction.build();
    }
}

module.exports = { BitcoinAddress, BitcoinTransfer };
