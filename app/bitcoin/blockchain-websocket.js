module.exports = {
    listen(http, publicKey, onBalanceChanged) {
        try {
            const ws = new WebSocket('wss://ws.blockchain.info/inv');

            ws.onopen = () => {
                ws.send(JSON.stringify({
                    op: 'addr_sub',
                    addr: publicKey
                }));
            };

            ws.onmessage = (message) => {
                const data = JSON.parse(message.data);
                if (data.op === 'status') {
                    console.log(`BlockchainWebsocket: ${data.msg}`);
                } else if (data.op === 'utx') {
                    http.getBalance(publicKey).then(onBalanceChanged);
                }
            };

            return function close() {
                ws.close();
            };
        } catch (err) {
            return function nop() {
            };
        }
    }
};