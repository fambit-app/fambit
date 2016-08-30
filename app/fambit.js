var bitcoin = require('bitcoin.js');


class Setup {
    static initializePlugin() {
        var address = this.createWallet();

        //TODO provide address to user, prompt user to provide funds to wallet
    }

    private createWallet() {
        return bitcoin.BitcoinAddress().createAddress()
    }
}

module.exports = {Setup};