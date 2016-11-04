const Persistence = require('../app/bitcoin/persistence.js');

//Creates mock in-memory storage that uses a map to store key-value pairs
let storage = [];
const persistence = new Persistence(
    (key, value) => storage[key] = value,
    (key) => {
        const value = storage[key];
        if (value === undefined) {
            return null; // to emulate localStorage returning null instead of undefined
        }
        return value;
    }
);
persistence.reset = () => storage = [];

module.exports = persistence;
