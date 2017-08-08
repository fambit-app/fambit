import test from 'ava';
import MockStore from './mock-store';
import pending from '../app/bitcoin/pending-donations';

function createMock() {
    const mock = new MockStore();
    mock.save('pending-donations', []);
    return mock;
}

test('should not initially have any pending donations', (t) => {
    const mock = createMock();
    t.deepEqual(pending.list(mock.retrieve), []);
});

test('should store multiple donations', (t) => {
    const mock = createMock();
    pending.queue(mock.retrieve, mock.save, 'A', 'spyu.ca', 1, new Date(0));
    pending.queue(mock.retrieve, mock.save, 'B', 'fuzzlesoft.ca', 2, new Date(1));

    t.deepEqual(pending.list(mock.retrieve), [
        {address: 'A', domain: 'spyu.ca', amount: 1, date: new Date(0)},
        {address: 'B', domain: 'fuzzlesoft.ca', amount: 2, date: new Date(1)}
    ]);
});

test('should group donations to same address on commit', (t) => {
    const mock = createMock();

    pending.queue(mock.retrieve, mock.save, 'A', 'spyu.ca', 1, new Date(0));
    pending.queue(mock.retrieve, mock.save, 'B', 'blockchain.info', 2, new Date(1));
    pending.queue(mock.retrieve, mock.save, 'A', 'fuzzlesoft.ca', 5, new Date(2));
    const result = pending.commit(mock.retrieve, mock.save);

    t.deepEqual(result, {
        A: 6,
        B: 2
    });
});

test('should clear pending donations after transaction', (t) => {
    const mock = createMock();

    pending.queue(mock.retrieve, mock.save, 'A', 'spyu.ca', 1, new Date(0));
    pending.queue(mock.retrieve, mock.save, 'B', 'fuzzlesoft.ca', 2, new Date(1));
    pending.commit(mock.retrieve, mock.save);

    t.deepEqual(pending.list(mock.retrieve), []);
});
