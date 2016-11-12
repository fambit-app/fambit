class MockStore {
    constructor() {
        this._data = {};
        this.save = this.save.bind(this);
        this.retrieve = this.retrieve.bind(this);
    }

    save(key, value) {
        this._data[key] = value;
    }

    retrieve(key) {
        return this._data[key] || null;
    }
}

module.exports = MockStore;