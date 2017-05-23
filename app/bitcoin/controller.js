const Raven = require('raven-js');
const PendingDonations = require('./pending-donations');
const bitcoinTransaction = require('./bitcoin-transaction');
const BlockchainHttp = require('./blockchain-http');
const BlockchainWs = require('./blockchain-websocket');
const Address = require('./address');

// 0.0001% of remaining funds are donated on-page-visit
const DEFAULT_DONATION_PERCENTAGE = 0.0001;
// By default, report errors to Sentry.
const REPORT_ERRORS = true;

/**
 * Gets bitcoin data and sends finished transactions to blockchain.info
 */
class LiveController {
    constructor(save, retrieve, donationPercentage) {
        this._save = save;
        this._retrieve = retrieve;
        this._pending = new PendingDonations(save, retrieve);
        this._http = new BlockchainHttp();
        this._ws = new BlockchainWs(this._http);
        this._address = Address.fromStorage(retrieve);
        this._donationPercentage = donationPercentage;

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

    }

    liveBalance(onBalanceChange) {
        this._ws.addListener((externalBalance) => {
            const actualBalance = externalBalance - this._pending.list().reduce((prev, donation) => prev + donation.amount, 0);

            this._save('cached-balance', JSON.stringify({
                date: Date.now(),
                value: actualBalance
            }));
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
                reason: 'Domain banned'
            });
        }

        return this.balance().then((balance) => {
            const amount = balance * this._donationPercentage;
            this._pending.queue(request.recipient, request.domain, amount, date);
            return {amount, date};
        });
    }

    updateDonationPercentage(donationPercentage) {
        this._donationPercentage = donationPercentage;
    }

    commitTransaction() {
        // Note: in `pending-donations`, `amount` is in milli-bitcoins
        const donations = this._pending.commit();
        const hash = bitcoinTransaction(donations);
        this._http.submitTransaction(this._address.publicKey, hash.toHex());
    }

    startRaven() {
        if (process.env.NODE_ENV === 'production') {
            console.log('Starting Raven to watch for errors');
            Raven.config('https://8d9e6a8ea4cd4e618bcc33992838b20b@sentry.fuzzlesoft.ca/8', {
                stacktrace: true
            }).install();
        }
    }
    stopRaven() {
        if (process.env.NODE_ENV === 'production') {
            console.log('Disabling Raven');
            Raven.uninstall();
        }
    }
}

/**
 * Gets bitcoin amount from LocalStorage with key 'fake-amount'.
 * Puts transactions into 'fake-transactions'
 *
 * Used when LocalStorage has the key 'FAKE' with value 'TRUE'
 */
class FakeController {
    constructor(save, retrieve, donationPercentage) {
        this._save = save;
        this._retrieve = retrieve;
        this._pending = new PendingDonations(save, retrieve);
        this._address = Address.fromStorage(retrieve);
        this._donationPercentage = donationPercentage;
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
                reason: 'Domain banned'
            });
        }

        return this.balance().then((balance) => {
            const amount = balance * this._donationPercentage;
            this._pending.queue(request.recipient, request.domain, amount, date);
            return {amount, date};
        });
    }

    updateDonationPercentage(donationPercentage) {
        this._donationPercentage = donationPercentage;
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

    startRaven() {}
    stopRaven() {}
}

/**
 * Only background.js needs to provide donationPercentage, because it's the only one calling donate()
 * @param donationPercentage
 * @param save
 * @param retrieve
 * @return Object controller
 */
function build(donationPercentage) {
    const save = localStorage.setItem.bind(localStorage);
    const retrieve = localStorage.getItem.bind(localStorage);
    const reportErrors = JSON.parse(retrieve('report-errors') || REPORT_ERRORS.toString());

    if (!Address.fromStorage(retrieve)) {
        Address.generate(save);
    }

    if (donationPercentage === undefined) {
        donationPercentage = DEFAULT_DONATION_PERCENTAGE;
    }

    if (retrieve('fake')) {
        console.log('Using fake controller');
        return new FakeController(save, retrieve, donationPercentage);
    }

    const controller = new LiveController(save, retrieve, donationPercentage);
    if (reportErrors) controller.startRaven();
    return controller;
}

module.exports = build;