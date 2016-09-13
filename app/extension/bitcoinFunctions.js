const bitcoin = require('../bitcoin/bitcoin.js');
const persistence = require('../bitcoin/persistence.js');

const address = new bitcoin.BitcoinAddress(persistence);
let transfer = new bitcoin.BitcoinTransfer(address);


function addDonation() {
    if (!transfer.sufficientInput()) {
        const unusedInputs = address.requestTransactionList()
            .map(output => ({ tx_hash: output.tx_hash, tx_index: output.tx_index, value: output.value }))
            .filter((output) => !transfer.inputs.some((input) => {
                input.index === output.tx_index && input.tx === output.tx_hash;
            }));


        do {
            if (unusedInputs.isEmpty) return false;

            while (transfer.inputs.contains(unusedInputs[0])) unusedInputs.remove(0);

            const newInput = unusedInputs[0];
            transfer.addInput(bitcoin.TransactionInput(newInput.tx_hash, newInput.tx_index, newInput.value));
        } while (!transfer.sufficientInput());
    }


    transfer.addOutput(address);
    return true;
}

/**
 * Sends an amount of bitcoin to the destination wallet
 * @param from      - Private key of the sender's bitcoin wallet
 */
function buildTransaction(from) {
    if (transfer.constructor !== bitcoin.BitcoinTransfer) {
        console.log('ERROR : Function should be provided an instance of BitcoinTransfer');
        return;
    }

    const transaction = new bitcoin.TransactionBuilder();

    for (const input in transfer.inputs) {
        transaction.addInput(input.tx, input.index);
    }

    for (const output in transfer.outputs) {
        transaction.addOutput(output.recipient, output.amount);
    }

    transfer = new bitcoin.BitcoinTransfer(address);    //Refresh transfer for next use, need to abstract this better

    const privateKey = bitcoin.ECPair.fromWIF(from);
    transaction.sign(0, privateKey);

    return transaction.build();
}