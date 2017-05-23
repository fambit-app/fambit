const PENDING_DONATIONS = 'pending-donations';

module.exports = {
    queue(retrieveLocal, saveLocal, address, domain, amount, date) {
        const donations = retrieveLocal(PENDING_DONATIONS);
        donations.push({address, domain, amount, date});
        saveLocal(PENDING_DONATIONS, donations);
    },

    list(retrieveLocal) {
        const donations = retrieveLocal(PENDING_DONATIONS);
        donations.forEach((donation) => donation.date = new Date(donation.date));
        return donations;
    },

    balancePending(retrieveLocal) {
        return this.list(retrieveLocal).reduce((prev, donation) => prev + donation.amount, 0);
    },

    removeDomain(retrieveLocal, saveLocal, domain) {
        const pendingDonations = retrieveLocal('pending-donations');
        saveLocal('pending-donations', pendingDonations.filter((donation) => donation.domain !== domain));
    },

    commit(retrieveLocal, saveLocal) {
        const donations = this.list(retrieveLocal); // TODO idk if this will work
        const rawDonations = {};

        // Group donations by bitcoin address, strips away unneeded info like date/domain
        donations.forEach((donation) => {
            const amountForAddress = rawDonations[donation.address] || 0;
            rawDonations[donation.address] = amountForAddress + donation.amount;
        });
        saveLocal(PENDING_DONATIONS, []);
        return rawDonations;
    }
};
