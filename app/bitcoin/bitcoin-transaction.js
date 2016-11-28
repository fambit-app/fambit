const bitcoinJS = require('bitcoinjs-lib');
const BlockchainHttp = require('./blockchain-http');

module.exports = function bitcoinTransaction(privateKey, publicKey, donations, http) {
    console.log(donations);
    const totalSatoshi = donations.reduce((total, donation) => total + donation.amount, 0) * 100; // μBTC -> satoshi
    const transaction = new bitcoinJS.TransactionBuilder();
    donations.forEach((donation) => transaction.addOutput(donation.address, donation.amount * 100));

    // Total amount of bitcoin from "input transactions" to be used to pay for all the microdonations.
    // This bitcoin comes from all the transactions from the user -> the fambit wallet
    let inputSatoshi = 0;
    http.getTransactionList(publicKey).then((unspentInputs) => {
        let localIndex = 0;
        while (inputSatoshi < totalSatoshi) {
            if (localIndex >= unspentInputs.length) {
                throw new Error('Not enough bitcoin to perform donation');
            }

            const inputToUse = unspentInputs[localIndex++];
            transaction.addInput(inputToUse.tx_hash, inputToUse.tx_index);
            inputSatoshi += inputToUse.value;
        }

        const privateKey = bitcoinJS.ECPair.fromWIF(privateKey);
        transaction.sign(0, privateKey);

        return transaction.build();
    });
};