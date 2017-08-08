const TRANSACTION_DELAY_MINUTES = 10080; // 1 week = 60 minutes * 24 hours * 7 days
module.exports = function init(retrieveMulti, isStoredLocally, saveMulti, saveLocal, requiredProperties,
    createDefaults) {
    if (!isStoredLocally('installed-locally')) {
        // First run on _this_ machine

        saveLocal('installed-locally', true);
        saveLocal('viewed-funded-popup', false);
        saveLocal('cached-balance', undefined);
        saveLocal('page-views', []);
        saveLocal('pending-donations', []);
    }

    return retrieveMulti(requiredProperties).then((res) => {
        if (res[requiredProperties[0]] !== undefined) { // One of the properties is set, this isn't a first-install
            return res;
        }

        chrome.alarms.create('SUBMIT_TRANSACTION', {
            periodInMinutes: TRANSACTION_DELAY_MINUTES
        });

        // Save defaults, then return defaults to original caller
        return createDefaults().then(defaults => saveMulti(defaults).then(() => defaults));
    });
};