const Persistence = require('../app/bitcoin/persistence.js');

//Creates mock in-memory storage that uses a map to store key-value pairs
var storage = [];
const persistence = new Persistence(
    (key, value) => storage[key] = value,
    (key) => storage[key]
);
persistence.reset = () => storage = [];

module.exports = persistence;
