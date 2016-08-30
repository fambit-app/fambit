var bitcoin = require('bitcoinjs-lib');
var storage = require('persistence.js');

class BitcoinAddress {
    createAddress() {
        if (this.hasBitcoinAddress()) return false;

        var keyPair = this.generateKeyPair();

        storage.addAddress(keyPair);

        return keyPair;
    }

    getAddress() {
        return bitcoin.ECPair.fromWIF(storage.getPrivateKey());
    }

    private generateKeyPair() {
        return bitcoin.ECPair.makeRandom()
    }

    private hasBitcoinAddress() {
        return storage.hasBitcoinAddress()
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
        var transaction = new bitcoin.TransactionBuilder();

        transaction.addInput(sourcetx, sourceIndex);
        transaction.addOutput(to, parseInt(amount));

        var privateKey = bitcoin.ECPair.fromWIF(from);
        transaction.sign(0, privateKey);

        return transaction.build();
    }
}

module.exports = {BitcoinAddress, BitcoinTransfer};
