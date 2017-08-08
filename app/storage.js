module.exports = {
    isStoredLocally(key) {
        return localStorage[key] !== undefined;
    },

    retrieveLocal(key) {
        const rawValue = localStorage[key];
        if (rawValue === undefined) {
            return undefined;
        }
        return JSON.parse(rawValue);
    },

    retrieve(key) {
        return new Promise((res) => {
            chrome.storage.sync.get(key, items => res(items[key]));
        });
    },

    retrieveMulti(keys) {
        return new Promise((res) => {
            chrome.storage.sync.get(keys, res);
        });
    },

    saveLocal(key, value) {
        const json = JSON.stringify(value);
        if (json === undefined) {
            localStorage.removeItem(key);
        } else {
            localStorage[key] = json;
        }
    },

    save(key, value) {
        const patch = {};
        patch[key] = value;
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