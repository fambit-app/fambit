import test from 'ava';

import PendingDonations from '../app/bitcoin/pending-donations'

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

test('should not initially have any pending donations', t => {
    const mock = new MockStore();
    const pending = new PendingDonations(mock.save, mock.retrieve);
    t.deepEqual(pending.list(), []);
});

test('should store multiple donations', t => {
    const mock = new MockStore();
    const pending = new PendingDonations(mock.save, mock.retrieve);
    pending.queue("A", 1, new Date(0));
    pending.queue("B", 2, new Date(1));
    t.deepEqual(pending.list(), [
        {address: "A", amount: 1, date: new Date(0)},
        {address: "B", amount: 2, date: new Date(1)}
    ]);
});

test('should run donations through transaction on commit', t => {
    const mock = new MockStore();
    const pending = new PendingDonations(mock.save, mock.retrieve);
    let result = undefined;
    function transact(donations) {
        result = donations;
    }

    pending.queue("A", 1, new Date(0));
    pending.queue("B", 2, new Date(1));
    pending.commit(transact);

    t.deepEqual(result, [
        {address: "A", amount: 1, date: new Date(0)},
        {address: "B", amount: 2, date: new Date(1)}
    ])
});

test('should clear pending donations after transaction', t => {
    const mock = new MockStore();
    const pending = new PendingDonations(mock.save, mock.retrieve);

    pending.queue("A", 1, new Date(0));
    pending.queue("B", 2, new Date(1));
    pending.commit(() => undefined);

    t.deepEqual(pending.list(), []);
});
