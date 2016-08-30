var bitcoin = require('./bitcoin/bitcoin.js');


class Setup {
    static initializePlugin() {
        const address = this.createWallet();

        //TODO provide address to user, prompt user to provide funds to wallet
    }

    createWallet() {
        return bitcoin.BitcoinAddress().createAddress();
    }
}

module.exports = { Setup };
