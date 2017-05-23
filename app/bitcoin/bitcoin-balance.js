const http = require('./blockchain-http');
const pending = require('./pending-donations');

// Minimum delay before cached information (e.g. balance) is updated from blockchain.info
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

module.exports = function balance(retrieveLocal, retrieve, saveLocal) {
    let promise;

    const cachedBalance = retrieveLocal('cached-balance');
    if (cachedBalance.date !== undefined && Date.now() < new Date(cachedBalance.date + CACHE_DURATION)) {
        promise = Promise.resolve(cachedBalance.value);
    } else {
        retrieve('public-key').then((publicKey) => {
            promise = http.getBalance(publicKey);
            promise.then((externalBalance) => {
                saveLocal('cached-balance', {
                    date: Date.now(),
                    value: externalBalance
                });
            });
        });
    }

    return promise.then((externalBalance) => externalBalance - pending.balancePending(retrieveLocal));
};

