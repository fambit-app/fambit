import test from 'ava';
import MockStore from './mock-store';
import PendingDonations from '../app/bitcoin/pending-donations';

test('should not initially have any pending donations', t => {
    const mock = new MockStore();
    const pending = new PendingDonations(mock.save, mock.retrieve);
    t.deepEqual(pending.list(), []);
});

test('should store multiple donations', t => {
    const mock = new MockStore();
    const pending = new PendingDonations(mock.save, mock.retrieve);
    pending.queue('A', 'spyu.ca', 1, new Date(0));
    pending.queue('B', 'fuzzlesoft.ca', 2, new Date(1));

    t.deepEqual(pending.list(), [
        {address: 'A', domain: 'spyu.ca', amount: 1, date: new Date(0)},
        {address: 'B', domain: 'fuzzlesoft.ca', amount: 2, date: new Date(1)}
    ]);
});

test('should group donations to same address on commit', t => {
    const mock = new MockStore();
    const pending = new PendingDonations(mock.save, mock.retrieve);

    pending.queue('A', 'spyu.ca', 1, new Date(0));
    pending.queue('B', 'blockchain.info', 2, new Date(1));
    pending.queue('A', 'fuzzlesoft.ca', 5, new Date(2));
    const result = pending.commit();

    t.deepEqual(result, {
        A: 6,
        B: 2
    });
});

test('should clear pending donations after transaction', t => {
    const mock = new MockStore();
    const pending = new PendingDonations(mock.save, mock.retrieve);

    pending.queue('A', 'spyu.ca', 1, new Date(0));
    pending.queue('B', 'fuzzlesoft.ca', 2, new Date(1));
    pending.commit();

    t.deepEqual(pending.list(), []);
});
