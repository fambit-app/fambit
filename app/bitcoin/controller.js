const PendingDonations = require('./pending-donations');
const BlockchainHttp = require('./blockchain-http');
const BlockchainWs = require('./blockchain-websocket');
const Address = require('./address');

// What percentage of remaining funds to donate on-page-visit
const PER_VISIT_DONATION = 0.0001;
// Minimum amount to send in a multi-donation transaction. If too low, then the blockchain won't process the donations.
// const THRESHOLD = 0.000001; // unused currently
// Minimum delay before cached information (e.g. balance) is updated from blockchain.info
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Gets bitcoin data and sends finished transactions to blockchain.info
 */
class LiveController {
    constructor(save, retrieve) {
        this._retrieve = retrieve;
        this._pending = new PendingDonations(save, retrieve);
        this._http = new BlockchainHttp();
        this._ws = new BlockchainWs(this._http);
        this._address = Address.fromStorage(retrieve);
        this._cachedBalance = undefined;

        if (this._address === null) {
            console.error('LiveController: bitcoin address has not been generated yet!');
        }
    }

    balance() {
        if (this._cachedBalance === undefined || Date.now() > new Date(this._cachedBalance.date.getTime() + CACHE_DURATION)) {
            const externalBalance = this._http.getBalance(this._address); // Balance as known by outside world
            const actualBalance = externalBalance - this._pending.list().reduce((prev, donation) => prev + donation.amount, 0);

            this._cachedBalance = {
                date: Date.now(),
                value: actualBalance
            };
        }
        return this._cachedBalance.value;
    }

    liveBalance(onBalanceChange) {
        this._ws.addListener((externalBalance) => {
            const actualBalance = externalBalance - this._pending.list().reduce((prev, donation) => prev + donation.amount, 0);

            this._cachedBalance = {
                date: Date.now(),
                value: actualBalance
            };
            onBalanceChange(actualBalance);
        });
    }

    donate(recipient) {
        const amount = this.balance() * PER_VISIT_DONATION;
        this._pending.queue(recipient, amount, Date.now());
    }

    commitTransaction() {

    }
}

/**
 * Gets bitcoin amount from LocalStorage with key 'fake-amount'.
 * Puts transactions into 'fake-transactions'
 *
 * Used when LocalStorage has the key 'FAKE' with value 'TRUE'
 */
class FakeController {
    constructor(save, retrieve) {
        this._save = save;
        this._retrieve = retrieve;
        this._pending = new PendingDonations(save, retrieve);
    }

    balance() {
        return this._retrieve('fake-amount') - this._pending.list().reduce((prev, donation) => prev + donation.amount, 0);
    }

    liveBalance(onBalanceChange) {
        onBalanceChange(this.balance());
    }

    donate(recipient) {
        const amount = this.balance() * PER_VISIT_DONATION;
        this._pending.queue(recipient, amount, Date.now());
    }

    commitTransaction() {
        let fakeTransactions = this._retrieve('fake-transactions');
        if (fakeTransactions === null) {
            fakeTransactions = {}
        } else {
            fakeTransactions = JSON.parse(fakeTransactions);
        }

        fakeTransactions[Date.now()] = this._pending.commit();
        this._save(JSON.stringify(fakeTransactions));
    }
}

function build(save, retrieve) {
    if (retrieve('FAKE')) {
        console.log('Using fake controller');
        return new FakeController(save, retrieve);
    }

    return new LiveController(save, retrieve);
}

module.exports = build;