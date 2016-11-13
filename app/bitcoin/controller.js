/**
 * Gets bitcoin data and sends finished transactions to blockchain.info
 */
class LiveController {

}

/**
 * Gets bitcoin amount from localstorage with key "fake-amount".
 * Puts transactions into "fake-transactions"
 */
class FakeController {
    constructor(save, retrieve) {
        this._save = save;
        this._retrieve = retrieve;
    }

    balance(address) {
        return this._retreive('fake-amount');
    }

    liveBalance(onBalanceChange) {
        onBalanceChange(this._retrieve('fake-amount'));
    }
}

function build(save, retrieve) {

}

module.exports = build;