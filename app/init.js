const bitcoinJS = require('bitcoinjs-lib');

const TRANSACTION_DELAY_MINUTES = 10080; // 1 week = 60 minutes * 24 hours * 7 days
module.exports = {
    prepare(retrieve, saveLocal, saveMulti) {
        return retrieve('public-key').then((publicKey) => {
            if (publicKey) {
                return;
            }
            // Otherwise, is first install

            chrome.alarms.create('SUBMIT_TRANSACTION', {
                periodInMinutes: TRANSACTION_DELAY_MINUTES
            });

            saveLocal('cached-balance', undefined);
            saveLocal('page-views', []);
            saveLocal('pending-donations', []);
            const keyPair = bitcoinJS.ECPair.makeRandom();
            return saveMulti({
                'private-key': keyPair.toWIF(),
                'public-key': keyPair.getAddress(),
                'onboard-status': 'NO_BITCOIN'
            });
        });
    }
};