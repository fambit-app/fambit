const PRIVATE_KEY = 'fambit-private-key';
const PUBLIC_KEY = 'fambit-public-key';

class Persistence {
    constructor(save, retrieve) {
        this.save = save;
        this.retrieve = retrieve;
    }

    hasBitcoinAddress() {
        return this.getPrivateKey() &&
            this.getPublicKey();
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
}

module.exports = Persistence;
