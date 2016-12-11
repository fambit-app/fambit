import test from 'ava';
import MockStore from './mock-store';
import BitcoinAddress from '../app/bitcoin/address';

test('should generate new address', t => {
    const mock = new MockStore();
    BitcoinAddress.generate(mock.save);

    t.is(mock.retrieve('private-key').length, 52);
    t.truthy(mock.retrieve('public-key').length >= 26 && mock.retrieve('public-key').length <= 35);
});

test('should return undefined if keys not in storage', t => {
    const mock = new MockStore();
    t.is(BitcoinAddress.fromStorage(mock.retrieve), undefined);
});

test('should return both keys on generate and fromStorage', t => {
    const mock = new MockStore();
    const generatedAddress = BitcoinAddress.generate(mock.save);
    const fromStorageAddress = BitcoinAddress.fromStorage(mock.retrieve);

    t.is(generatedAddress.privateKey.length, 52);
    t.truthy(generatedAddress.publicKey.length >= 26 && generatedAddress.publicKey.length <= 35);
    t.is(generatedAddress.privateKey, fromStorageAddress.privateKey);
    t.is(generatedAddress.publicKey, fromStorageAddress.publicKey);
});