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

    constructor() {
        this.inputs = [];
        this.outputs = [];
    }

    addInput(input) {
        if (input.constructor != TransactionInput) {
            console.log('ERROR : input not of type TransactionInput');
            return;
        }

        this.inputs.add(input);
    }

    addOutput(output) {
        if (output.constructor != TransactionOutput) {
            console.log('ERROR : input not of type TransactionOutput');
            return;
        }

        this.outputs.add(output);
    }

    /**
     * Sends an amount of bitcoin to the destination wallet
     * @param transfer  - An instance of BitcoinTransfer containing a list of inputs and a list of outputs
     * @param from      - Private key of the sender's bitcoin wallet
     */
    static buildTransaction(transfer, from) {
        if (transfer.constructor != BitcoinTransfer) {
            console.log('ERROR : Function should be provided an instance of BitcoinTransfer');
            return;
        }

        const transaction = new bitcoin.TransactionBuilder();

        for (const input in transfer.inputs) {
            transaction.addInput(input.tx, input.index);
        }

        for (const output in transfer.outputs) {
            transaction.addOutput(output.recipient, output.amount)
        }

        const privateKey = bitcoin.ECPair.fromWIF(from);
        transaction.sign(0, privateKey);

        return transaction.build();
    }
}

class TransactionInput {
    constructor(tx, index) {
        this.tx = tx;
        this.index = index;
    }
}

class TransactionOutput {
    constructor(recipient, amount) {
        this.recipient = recipient;
        this.amount = amount;
    }
}

module.exports = { BitcoinAddress, BitcoinTransfer, TransactionInput, TransactionOutput };
