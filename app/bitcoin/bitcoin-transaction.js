const bitcoinJS = require('bitcoinjs-lib');

// The number of satoshis to pay to the miners, based on how many "outputs"/donations occurred.
// According to http://www.coindesk.com/new-service-finds-optimum-bitcoin-transaction-fee, it's chill to provide a fee
// of 10 satoshis per byte.
// http://bitcoin.stackexchange.com/a/3011 says that each output is 34 bytes.
// Ignoring fixed bytes, as well as byte cost for inputs for simplicity, and because I'd rather err on the side of
// paying less fees, since a long confirmation delay is OK, considering that fambit donations are _very_ async in
// nature (one week delay already, so ¯\_(ツ)_/¯
const MINING_FEE_RATIO = 340;

module.exports = function bitcoinTransaction(privateKey, publicKey, donations, http) {
    const donationCount = Object.keys(donations).length;
    const miningFee = donationCount * MINING_FEE_RATIO;
    let totalDonatedSatoshi = 0;

    const transaction = new bitcoinJS.TransactionBuilder();
    for (const address in donations) {
        if (Object.prototype.hasOwnProperty.call(donations, address)) {
            const amount = donations[address] * 100; // μBTC -> satoshi
            transaction.addOutput(address, amount);
            totalDonatedSatoshi += amount;
        }
    }

    // Total amount of bitcoin from "input transactions" to be used to pay for all the microdonations.
    // This bitcoin comes from all the transactions from the user -> the fambit wallet
    let inputSatoshi = 0;
    http.getTransactionList(publicKey).then((unspentInputs) => {
        let localIndex = 0;
        while (inputSatoshi < totalDonatedSatoshi) {
            if (localIndex >= unspentInputs.length) {
                throw new Error('Not enough bitcoin to perform donation');
            }

            const inputToUse = unspentInputs[localIndex++];
            transaction.addInput(inputToUse.tx_hash, inputToUse.tx_index);
            inputSatoshi += inputToUse.value;
        }

        // Put "dust" back in receiving address. Leftover bitcoin not put in an output is given as a fee
        // to the miner
        const dust = inputSatoshi - totalDonatedSatoshi;
        if (dust > 0) {
            transaction.addOutput(publicKey, dust - miningFee);
        }

        transaction.sign(0, bitcoinJS.ECPair.fromWIF(privateKey));
        return transaction.build();
    });
};