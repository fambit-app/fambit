const bitcoin = require('../bitcoin/bitcoin.js');
const persistence = require('../bitcoin/persistence.js');

const address = new bitcoin.BitcoinAddress(persistence);
let transfer = new bitcoin.BitcoinTransfer(address);


function addDonation() {
    if (!transfer.sufficientInput()) {  //If current input isn't enough, attempt to add more before proceeding
        const unusedInputs = address.requestTransactionList()   //Get list of all unspent transactions associated with this address
            .map(output => ({ tx_hash: output.tx_hash, tx_index: output.tx_index, value: output.value }))
            .filter((output) => !transfer.inputs.some((input) => {  //Filter based on what ones are already in use for building the current transaction
                input.index === output.tx_index && input.tx === output.tx_hash;
            }));


        do {
            if (unusedInputs.length === 0) return false; //If we can't add enough input, return false (the current transaction should probably be sent)

            while (transfer.inputs.contains(unusedInputs[0])) unusedInputs.remove(0);

            const newInput = unusedInputs[0];
            transfer.addInput( { tx: newInput.tx_hash, index: newInput.tx_index, value: newInput.value } );
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

module.exports = { address, transfer, addDonation, buildTransaction };
