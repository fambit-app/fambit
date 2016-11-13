const PENDING_KEY = 'PENDING_DONATIONS';

class PendingDonations {
    constructor(save, retrieve) {
        this.save = save || ((key, value) => localStorage.setItem(key, value));
        this.retrieve = retrieve || ((key) => localStorage.getItem(key));

        if (this.retrieve(PENDING_KEY) === null) {
            this.save(PENDING_KEY, []);
        }
    }

    queue(address, amount, date) {
        const donations = this.retrieve(PENDING_KEY);
        donations.push({address, amount, date});
        this.save(PENDING_KEY, donations);
    }

    list() {
        return this.retrieve(PENDING_KEY);
    }

    commit() {
        const transactions = this.retrieve(PENDING_KEY);
        this.save(PENDING_KEY, []);
        return transactions;
    }
}

module.exports = PendingDonations;
