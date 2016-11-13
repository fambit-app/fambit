const PendingDonations = require('./pending-donations');
const BlockchainHttp = require('./blockchain-http');
const BlockchainWs = require('./blockchain-websocket');
const Address = require('./address');

/**
 * Gets bitcoin data and sends finished transactions to blockchain.info
 */
class LiveController {
    constructor(save, retrieve) {
        this._retrieve = retrieve;
        this._pending = new PendingDonations(save, retrieve);
        this._http = new BlockchainHttp();
        this._ws = new BlockchainWs(this._http);
        this._address = Address.fromStorage(retrieve);

        if (this._address === null) {
            console.error('LiveController: bitcoin address has not been generated yet!');
        }
    }

    balance() {
        return this._http.getBalance(this._address);
    }

    liveBalance(onBalanceChange) {
        this._ws.addListener(onBalanceChange);
    }

    donate(recipient) {

    }

    commitTransaction() {

    }
}

/**
 * Gets bitcoin amount from localstorage with key "fake-amount".
 * Puts transactions into "fake-transactions"
 */
class FakeController {
    constructor(save, retrieve) {
        this._retrieve = retrieve;
        this._pending = new PendingDonations(save, retrieve);
    }

    balance() {
        return this._retrieve('fake-amount');
    }

    liveBalance(onBalanceChange) {
        onBalanceChange(this._retrieve('fake-amount'));
    }

    donate(recipient) {

    }

    commitTransaction() {

    }
}

function build(save, retrieve) {
    if (retrieve('FAKE')) {
        return new FakeController(save, retrieve);
    } else {
        return new LiveController(save, retrieve);
    }
}

module.exports = build;