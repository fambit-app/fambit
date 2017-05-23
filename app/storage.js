module.exports = {
    retrieveLocal(key) {
        return JSON.parse(localStorage[key]);
    },

    retrieve(key) {
        return new Promise((res) => {
            chrome.storage.sync.get(key, (items) => res(items[key]));
        });
    },

    retrieveMulti(keys) {
        return new Promise((res) => {
            chrome.storage.sync.get(keys, res);
        });
    },

    saveLocal(key, value) {
        return localStorage[key] = JSON.stringify(value);
    },

    save(key, value) {
        const patch = {};
        patch[key] = value
        return new Promise((res) => {
            chrome.storage.sync.set(patch, res);
        });
    },

    saveMulti(patch) {
        return new Promise((res) => {
            chrome.storage.sync.set(patch, res);
        });
    }
};