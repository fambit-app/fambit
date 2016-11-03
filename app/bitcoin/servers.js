class BitcoinServerRequests {

    getBalance(address) {
        const response = this.makeRequest(`https://www.blockchain.info/address/${address}?format=json`);
        if (response) {
            const json = JSON.parse(response.body);
            return json.final_balance;
        }
        return -1;
    }
    getTransactionList(address) {
        const response = this.makeRequest(`https://www.blockchain.info/unspent?active=${address}`);
        if (response) {
            const json = JSON.parse(response.body);
            return json.unspent_outputs;
        }
        return [];
    }


    makeRequest(url) {
        const request = new XMLHttpRequest();
        request.open('GET', url, false);
        request.timeout = 5000;
        request.send();
        return request.responseText;
    }
}

module.exports = BitcoinServerRequests;
