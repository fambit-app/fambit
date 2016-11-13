const bitcoinJS = require('bitcoinjs-lib');
const BlockchainHttp = require('./blockchain-http');

const http = new BlockchainHttp();

class BitcoinTransfer {

    constructor(publicKey) {
        this.publicKey = publicKey;
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
        this.outputs.add({recipient: this.publicKey, amount: this.currentInputValue});

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

class Donations {
    constructor(privateKey, publicKey) {
        this._privateKey = privateKey;
        this._publicKey = publicKey;
        this._transfer = new BitcoinTransfer(publicKey);
    }

    addDonation(recipient) {
        if (!this._transfer.sufficientInput()) {  //If current input isn't enough, attempt to add more before proceeding
            const unusedInputs = http.getTransactionList(this._publicKey)   //Get list of all unspent transactions associated with this address
                .map(output => ({tx_hash: output.tx_hash, tx_index: output.tx_index, value: output.value})) // Removes unused properties
                .filter((output) => !this._transfer.inputs.some((input) => {  //Filter based on what inputs are already in use for building the current transaction
                    if (input.index === output.tx_index && input.tx === output.tx_hash) {
                        return input;
                    }
                    return undefined;
                }));


            do {
                if (unusedInputs.length === 0) return false; //If we can't add enough input, return false (the current transaction should probably be sent)

                while (this._transfer.inputs.includes(unusedInputs[0])) unusedInputs.remove(0);

                const newInput = unusedInputs[0];
                this._transfer.addInput({tx: newInput.tx_hash, index: newInput.tx_index, value: newInput.value});
            } while (!this._transfer.sufficientInput());
        }


        this._transfer.addOutput(recipient);
        return true;
    }

    /**
     * Sends an amount of bitcoin to the destination wallet
     * @return a hash of the multi-donation transaction. Should be sent to blockchain.info
     */
    transactionHash() {
        const transaction = new bitcoinJS.TransactionBuilder();

        for (const input in this._transfer.inputs) {
            if (!(input.tx === undefined) && !(input.index === undefined)) {
                transaction.addInput(input.tx, input.index);
            }
        }

        for (const output in this._transfer.outputs) {
            if (!(output.recipient === undefined) && !(output.amount === undefined)) {
                transaction.addOutput(output.recipient, output.amount);
            }
        }

        this._transfer = new BitcoinTransfer(this._address);    //Refresh transfer for next use, need to abstract this better

        const privateKey = bitcoinJS.ECPair.fromWIF(this._privateKey);
        transaction.sign(0, privateKey);

        return transaction.build();
    }
}

module.exports = Donations;