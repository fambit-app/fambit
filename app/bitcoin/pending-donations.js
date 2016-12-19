const PENDING_KEY = 'pending-donations';

class PendingDonations {
    constructor(save, retrieve) {
        this._save = save;
        this._retrieve = retrieve;

        if (this._retrieve(PENDING_KEY) === null) {
            this._save(PENDING_KEY, '[]');
        }
    }

    queue(address, domain, amount, date) {
        const donations = JSON.parse(this._retrieve(PENDING_KEY));
        donations.push({address, domain, amount, date});
        this._save(PENDING_KEY, JSON.stringify(donations));
    }

    list() {
        const donations = JSON.parse(this._retrieve(PENDING_KEY));
        donations.forEach((donation) => donation.date = new Date(donation.date));
        return donations;
    }

    commit() {
        const donations = this.list();
        const rawDonations = {};

        // Group donations by bitcoin address, strips away unneeded info like date/domain
        donations.forEach((donation) => {
            const amountForAddress = rawDonations[donation.address] || 0;
            rawDonations[donation.address] = amountForAddress + donation.amount;
        });
        this._save(PENDING_KEY, '[]');
        return rawDonations;
    }
}

module.exports = PendingDonations;
