import test from 'ava';
import format from '../app/extension/bitcoin-format';

test('should display micro-bitcoin (μBTC)', t => {
    t.is(format(0.00001), '0.01 μBTC'); // satoshi
    t.is(format(0.00016), '0.16 μBTC'); // bitcoin-mill
    t.is(format(0.001), '1.00 μBTC'); // micro-bitcoin
    t.is(format(0.00256), '2.56 μBTC'); // bitcoin-san
});

test('should display milli-bitcoin (mBTC)', t => {
    t.is(format(0.04096), '0.04 mBTC'); // bitcoin-ton
    t.is(format(0.65536), '0.66 mBTC'); // bitcoin (TBC)
    t.is(format(1), '1.00 mBTC'); // milli-bitcoin
});

test('should display bitcoin (BTC)', t => {
    t.is(format(10), '0.01 BTC'); // centi-bitcoin
    t.is(format(10.48576), '0.01 BTC'); // ton-bitcoin
    t.is(format(100), '0.10 BTC'); // deci-bitcoin
    t.is(format(167.77216), '0.17 BTC'); // san-bitoin
    t.is(format(1000), '1.00 BTC'); // bitcoin (BTC)
    t.is(format(2684.35456), '2.68 BTC'); // mill-bitcoin
});