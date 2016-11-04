class BitcoinServerRequests {

    getBalance(address) {
        const response = this._getRequest('GET', `https://www.blockchain.info/address/${address}?format=json`);
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


    submitTransaction(hash) {
        const response = this._postRequest('POST', `https://www.blockchain.info/pushtx`, `tx=${hash}`);
    }

    _getRequest(url) {
        const request = new XMLHttpRequest();
        request.open('GET', url, true);

        request.onreadystatechange = function() {
            if (request.readyState === 4 && request.status === 400) {
                return request.responseText;
            }
        };

        request.timeout = 5000;
        request.send();
    }

    _postRequest(url, params) {
        const request = new XMLHttpRequest();
        request.open('POST', url, true);

        request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        request.onreadystatechange = function() {
            if(request.readyState === 4 && request.status === 400) {
                return request.responseText;
            }
        };

        request.send(params);
    }
}

module.exports = BitcoinServerRequests;
