const Raven = require('raven-js');

class BlockchainWebsocket {
    constructor(http, address) {
        this._connect(http, address);
        this._listeners = [];
        this.lastBalance = undefined;

        setInterval(() => {
            if (this._ws.readyState > 1) {
                this._connect();
            } else if (this._ws.readyState === 1) {
                this._ws.send(JSON.stringify({
                    op: 'ping'
                }));
            }
        }, 30 * 1000); // Every 30 seconds
    }

    _connect(http, address) {
        try {
            this._ws = new WebSocket('wss://ws.blockchain.info/inv');
            this._ws.onmessage = (message) => {
                const data = JSON.parse(message.data);
                if (data.op === 'status') {
                    console.log(`BlockchainWebsocket: ${data.msg}`);
                } else if (data.op === 'utx') {
                    http.getBalance(address.publicKey).then((balance) => {
                        this.lastBalance = balance;
                        this._listeners.forEach((onBalanceChanged) => onBalanceChanged(balance));
                    });
                }
            };

            this._ws.onopen = () => {
                this._ws.send(JSON.stringify({
                    op: 'addr_sub',
                    addr: address
                }));
            };
        } catch (err) {
            // Probably failed to connect due to bad internet. Might as well send to Sentry, just in case network is fine
            Raven.captureMessage('Blockchain balance request failed', err);
        }
    }

    addListener(onBalanceChanged) {
        this._listeners.push(onBalanceChanged);
        if (this.lastBalance !== undefined) {
            onBalanceChanged(this.lastBalance);
        }
    }
}

module.exports = BlockchainWebsocket;
