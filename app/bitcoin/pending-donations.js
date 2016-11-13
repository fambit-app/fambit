const PENDING_KEY = 'PENDING_DONATIONS';

class PendingDonations {
    constructor(save, retrieve) {
        this._save = save;
        this._retrieve = retrieve;

        if (this._retrieve(PENDING_KEY) === null) {
            this._save(PENDING_KEY, []);
        }
    }

    queue(address, amount, date) {
        const donations = this._retrieve(PENDING_KEY);
        donations.push({address, amount, date});
        this._save(PENDING_KEY, donations);
    }

    list() {
        return this._retrieve(PENDING_KEY);
    }

    commit() {
        const transactions = this._retrieve(PENDING_KEY);
        this._save(PENDING_KEY, []);
        return transactions;
    }
}

module.exports = PendingDonations;
