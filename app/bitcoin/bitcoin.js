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

    requestBalance() {
        const address = this.persistence.getPublicKey();
        return this.serverRequests.getBalance(address);
    }

    requestTransactionList() {
        const address = this.persistence.getPublicKey();
        return this.serverRequests.getTransactionList(address);
    }

    _getKeyPair() {
        return bitcoin.ECPair.fromWIF(this.persistence.getPrivateKey());
    }

    _generateKeyPair() {
        return bitcoin.ECPair.makeRandom();
    }

    _hasBitcoinAddress() {
        return this.persistence.hasBitcoinAddress();
    }
}


//Instantiate BitcoinTransfer to begin building a list of inputs and outputs
class BitcoinTransfer {

    constructor(myAddress) {
        this.myAddress = myAddress;
        this.inputs = [];
        this.outputs = [];
        this.currentInputValue = 0;
        this.PERCENTAGE_CONSTANT = 0.2;
        this.THRESHOLD = 0.000001;
    }

    addInput(input) {
        if (!('tx' in input) || !('index' in input) || !('value' in input)) {
            console.log('ERROR : input should be defined as {tx, index, value}');
            return;
        }

        //Send dust from previous transaction back to user's address
        this.outputs.add({recipient: this.myAddress, amount: this.currentInputValue});

        this.currentInputValue = input.value;
        this.inputs.add(input);
    }

    addOutput(address) {
        //Get amount to add based on the percentage to add
        const amount = this.currentInputValue - (this.currentInputValue * this.PERCENTAGE_CONSTANT);
        this.currentInputValue -= amount;
        this.outputs.add({recipient: address, amount});
    }

    sufficientInput() {
        return this.currentInputValue - (this.currentInputValue * this.PERCENTAGE_CONSTANT) >= this.THRESHOLD;
    }
}

module.exports = {BitcoinAddress, BitcoinTransfer};
