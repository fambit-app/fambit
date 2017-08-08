module.exports = function createDonation(isStoredLocally, retrieveLocal, retrieve, saveLocal, getBalance, donationPercentage,
                                         bannedDomains, pending, request) {
    const date = Date.now();
    if (!request.recipient) {
        return Promise.resolve({
            date,
            reason: 'No Fambit support'
        });
    }
    if (bannedDomains.indexOf(request.domain) !== -1) {
        return Promise.resolve({
            date,
            reason: 'Domain banned'
        });
    }

    return getBalance(isStoredLocally, retrieveLocal, retrieve, saveLocal).then((b) => {
        const amount = b * (donationPercentage / 100);
        pending.queue(retrieveLocal, saveLocal, request.recipient, request.domain, amount, date);
        return {amount, date};
    });
};