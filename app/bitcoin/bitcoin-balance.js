const http = require('./blockchain-http');
const pending = require('./pending-donations');

// Minimum delay before cached information (e.g. balance) is updated from blockchain.info
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

module.exports = function balance(isStoredLocally, retrieveLocal, retrieve, saveLocal) {
    let promise;
    if (isStoredLocally('fake-amount')) {
        promise = Promise.resolve(retrieveLocal('fake-amount'));
    } else {
        const cachedBalance = retrieveLocal('cached-balance');
        if (cachedBalance !== undefined && Date.now() < new Date(cachedBalance.date + CACHE_DURATION)) {
            promise = Promise.resolve(cachedBalance.value);
        } else {
            promise = retrieve('public-key').then(publicKey => http.getBalance(publicKey).then((externalBalance) => {
                saveLocal('cached-balance', {
                    date: Date.now(),
                    value: externalBalance
                });
                return externalBalance;
            }));
        }
    }

    return promise.then(externalBalance => externalBalance - pending.balancePending(retrieveLocal));
};

