const bitcoin = require('bitcoinjs-lib');
const storage = require('./persistence');

class BitcoinAddress {
    constructor(save, retrieve) {
        this.persistence = storage.Persistence(save, retrieve);
    }

    createAddress() {
        if (this._hasBitcoinAddress()) return false;

        const keyPair = this._generateKeyPair();

        this.persistence.setAddress(keyPair);

        return keyPair;
    }

    getAddress() {
        return bitcoin.ECPair.fromWIF(this.persistence.getPrivateKey());
    }

    _generateKeyPair() {
        return bitcoin.ECPair.makeRandom();
    }

    _hasBitcoinAddress() {
        return this.persistence.hasBitcoinAddress();
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
