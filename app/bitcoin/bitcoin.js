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

    checkBalance() {
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
        if (input.constructor != TransactionInput) {
            console.log('ERROR : input not of type TransactionInput');
            return;
        }

        //Send dust from previous transaction back to user's address
        this.outputs.add(TransactionOutput(this.myAddress, this.currentInputValue));

        this.currentInputValue = input.value;
        this.inputs.add(input);
    }

    addOutput(address) {
        const amount = this.currentInputValue - this.PERCENTAGE_CONSTANT;
        this.currentInputValue -= amount;
        this.outputs.add(TransactionOutput(address, amount));
    }

    sufficientInput() {
        return this.currentInputValue - (this.currentInputValue * this.PERCENTAGE_CONSTANT) >= this.THRESHOLD;
    }
}


const transfer = BitcoinTransfer();
const address = BitcoinAddress();

function addDonation(address) {
    if (!transfer.sufficientInput()) {
        const unusedInputs = address.requestTransactionList()
            .map(output => ({tx_hash: output.tx_hash, tx_index: output.tx_index, value: output.value}))
            .filter((output) => !transfer.inputs.some((input) => {
                input.index === output.tx_index && input.tx == output.tx_hash
            }));


        do {
            if (unusedInputs.isEmpty) return false;

            while (transfer.inputs.contains(unusedInputs[0])) unusedInputs.remove(0);
            
            const newInput = unusedInputs[0];
            transfer.addInput(new TransactionInput(newInput.tx_hash, newInput.tx_index, newInput.value));
        } while (!transfer.sufficientInput());
    }


    transfer.addOutput(address);
    return true;
}

/**
 * Sends an amount of bitcoin to the destination wallet
 * @param transfer  - An instance of BitcoinTransfer containing a list of inputs and a list of outputs
 * @param from      - Private key of the sender's bitcoin wallet
 */
function buildTransaction(transfer, from) {
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

class TransactionInput {
    constructor(tx, index, value) {
        this.tx = tx;
        this.index = index;
        this.value = value;
    }
}

class TransactionOutput {
    constructor(recipient, amount) {
        this.recipient = recipient;
        this.amount = amount;
    }
}

module.exports = { BitcoinAddress, buildTransaction, addDonation };
