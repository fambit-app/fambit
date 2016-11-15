class BlockchainWebsocket {
    constructor(http, address) {
        this._ws = new WebSocket('wss://ws.blockchain.info/inv');
        this._listeners = [];
        this.lastBalance = undefined;

        this._ws.onmessage = (message) => {
            const data = JSON.parse(message.data);
            if (data.op === 'status') {
                console.log(`BlockchainWebsocket: ${data.msg}`);
            } else if (data.op === 'utx') {
                this.lastBalance = http.getBalance(address.publicKey);
                this._listeners.forEach((onBalanceChanged) => onBalanceChanged(this.lastBalance));
            }
        };

        this._ws.onopen = () => {
            this._ws.send(JSON.stringify({
                op: 'addr_sub',
                addr: address
            }));
        };

        setInterval(() => {
            this._ws.send(JSON.stringify({
                op: 'ping'
            }));
        }, 30 * 1000); // Every 30 seconds
    }

    addListener(onBalanceChanged) {
        this._listeners.push(onBalanceChanged);
        if (this.lastBalance !== undefined) {
            onBalanceChanged(this.lastBalance);
        }
    }
}

module.exports = BlockchainWebsocket;
