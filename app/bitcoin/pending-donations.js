const PENDING_KEY = 'pending-donations';

class PendingDonations {
    constructor(save, retrieve) {
        this._save = save;
        this._retrieve = retrieve;

        if (this._retrieve(PENDING_KEY) === null) {
            this._save(PENDING_KEY, '[]');
        }
    }

    queue(address, amount, date) {
        const donations = JSON.parse(this._retrieve(PENDING_KEY));
        donations.push({address, amount, date});
        this._save(PENDING_KEY, JSON.stringify(donations));
    }

    list() {
        const donations = JSON.parse(this._retrieve(PENDING_KEY));
        donations.forEach((donation) => donation.date = new Date(donation.date));
        return donations;
    }

    commit() {
        const transactions = this.list();
        this._save(PENDING_KEY, '[]');
        return transactions;
    }
}

module.exports = PendingDonations;
