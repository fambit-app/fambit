class Donations {

    constructor(address) {
        this._address = address;
        this._transfer = new bitcoin.BitcoinTransfer(this._address)
    }

    addDonation() {
        if (!this._transfer.sufficientInput()) {  //If current input isn't enough, attempt to add more before proceeding
            const unusedInputs = this._address.requestTransactionList()   //Get list of all unspent transactions associated with this address
                .map(output => ({tx_hash: output.tx_hash, tx_index: output.tx_index, value: output.value}))
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


        this._transfer.addOutput(this._address);
        return true;
    }

    /**
     * Sends an amount of bitcoin to the destination wallet
     * @param privateKey Private key of the sender's bitcoin wallet
     */
    buildTransaction(privateKey) {
        const transaction = new bitcoin.TransactionBuilder();

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

        this._transfer = new bitcoin.BitcoinTransfer(this._address);    //Refresh transfer for next use, need to abstract this better

        const privateKey = bitcoin.ECPair.fromWIF(privateKey);
        transaction.sign(0, privateKey);

        return transaction.build();
    }
}

module.exports = Donations;