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

        if (this._address === undefined) {
            console.error('LiveController: bitcoin address has not been generated yet!');
        }
    }

    publicKey() {
        return this._address.publicKey;
    }

    /**
     * Returns the balance in milli-bitcoins
     * @return {*}
     */
    balance() {
        if (this._cachedBalance !== undefined && Date.now() < new Date(this._cachedBalance.date.getTime() + CACHE_DURATION)) {
            return Promise.resolve(this._cachedBalance.value);
        }

        return this._http.getBalance(this.publicKey()).then((externalBalance) => {
            const actualBalance = externalBalance - this._pending.list().reduce((prev, donation) => prev + donation.amount, 0);

            this._cachedBalance = {
                date: Date.now(),
                value: actualBalance
            };
            return actualBalance;
        });
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

    donate(request) {
        const date = Date.now();
        const bannedDomains = JSON.parse(localStorage.getItem('banned-domains') || '[]');
        if (!request.recipient) {
            return Promise.resolve({
                date,
                reason: 'No Fambit support'
            });
        } else if (bannedDomains.indexOf(request.domain) !== -1) {
            return Promise.resolve({
                date,
                reason: 'Domain is banned'
            });
        }

        return this.balance().then((balance) => {
            const amount = balance * PER_VISIT_DONATION;
            this._pending.queue(request.recipient, amount, date);
            return {recipient: request.recipient, amount, date};
        });
    }

    commitTransaction() {
        // Note: in `pending-donations`, `amount` is in milli-bitcoins
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
        this._address = Address.fromStorage(retrieve);
    }

    publicKey() {
        return this._address.publicKey;
    }

    balance() {
        const externalBalance = this._retrieve('fake-amount') || 0;
        const pendingCost = this._pending.list().reduce((prev, donation) => prev + donation.amount, 0);
        return Promise.resolve(externalBalance - pendingCost);
    }

    liveBalance(onBalanceChange) {
        this.balance().then((startBalance) => {
            let lastBalance = startBalance;
            setInterval(() => {
                this.balance().then((currentBalance) => {
                    if (lastBalance === currentBalance) {
                        return;
                    }

                    lastBalance = currentBalance;
                    onBalanceChange(currentBalance);
                });
            }, 1000);
        });
    }

    donate(request) {
        const date = Date.now();
        const bannedDomains = JSON.parse(localStorage.getItem('banned-domains') || '[]');
        if (!request.recipient) {
            return Promise.resolve({
                date,
                reason: 'No Fambit support'
            });
        } else if (bannedDomains.indexOf(request.domain) !== -1) {
            return Promise.resolve({
                date,
                reason: 'Domain is banned'
            });
        }

        return this.balance().then((balance) => {
            const amount = balance * PER_VISIT_DONATION;
            this._pending.queue(request.recipient, request.domain, amount, date);
            return {amount, date};
        });
    }

    commitTransaction() {
        let fakeTransactions = this._retrieve('fake-transactions');
        if (fakeTransactions === null) {
            fakeTransactions = {};
        } else {
            fakeTransactions = JSON.parse(fakeTransactions);
        }

        fakeTransactions[Date.now()] = this._pending.commit();
        this._save(JSON.stringify(fakeTransactions));
    }
}

function build(save, retrieve) {
    save = save || localStorage.setItem.bind(localStorage);
    retrieve = retrieve || localStorage.getItem.bind(localStorage);

    if (!Address.fromStorage(retrieve)) {
        Address.generate(save);
    }

    if (retrieve('fake')) {
        console.log('Using fake controller');
        return new FakeController(save, retrieve);
    }

    return new LiveController(save, retrieve);
}

module.exports = build;