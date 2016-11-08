const PRIVATE_KEY = 'fambit-private-key';
const PUBLIC_KEY = 'fambit-public-key';
const UNSPENT_TRANSACTIONS = 'fambit-unspent-transactions';

class Persistence {
    constructor(save, retrieve) {
        this.save = save || ((key, value) => localStorage.setItem(key, value));
        this.retrieve = retrieve || ((key) => localStorage.getItem(key));
    }

    hasBitcoinAddress() {
        return this.getPrivateKey() !== null &&
            this.getPublicKey() !== null;
    }

    setAddress(keyPair) {
        this.save(PRIVATE_KEY, keyPair.toWIF());
        this.save(PUBLIC_KEY, keyPair.getAddress());
    }

    getPrivateKey() {
        return this.retrieve(PRIVATE_KEY);
    }

    getPublicKey() {
        return this.retrieve(PUBLIC_KEY);
    }

    /**
     * Stores a list of unspent transactions associated with the fambit user's address
     * @param transactionList   - The transaction list in JSON format
     */
    setUnspentTransactions(transactionList) {
        this.save(UNSPENT_TRANSACTIONS, transactionList);
    }

    getUnspentTransactions() {
        return this.retrieve(UNSPENT_TRANSACTIONS);
    }
}

module.exports = Persistence;
