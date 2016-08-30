import test from 'ava';
import output from '../app/index.js';

test('Ava should run tests', t => {
    t.is(output(), 'Hello World');
});
