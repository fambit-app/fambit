const Raven = require('raven-js');

class BlockchainHttp {

    /**
     * Returns the balance of the wallet in milli-bitcoin
     * @param address bitcoin address to check balance for
     * @return {Promise.<number>}
     */
    getBalance(address) {
        return this._getRequest(`https://blockchain.info/q/addressbalance/${address}`)
            .then((val) => parseInt(val) / 100000)
            .catch((err) => {
                Raven.captureMessage("Blockchain balance request failed", err);
            })
    }

    getTransactionList(address) {
        const promise = this._getRequest(`https://blockchain.info/unspent?active=${address}`);

        promise.then((val) => {
            const json = JSON.parse(val.body);
            return json.unspent_outputs;
        });
    }


    submitTransaction(hash) {
        return this._postRequest('https://blockchain.info/pushtx', `tx=${hash}`);
    }

    _getRequest(url) {
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.open('GET', url, true);

            request.onreadystatechange = function () {
                if (request.readyState === 4) {
                    if (request.status === 200) {
                        resolve(request.responseText);
                    } else {
                        reject({status: request.status, data: request.responseText});
                    }
                }
            };

            request.timeout = 5000;
            request.send();
        });
    }

    _postRequest(url, params) {
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.open('POST', url, true);

            request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

            request.onreadystatechange = function () {
                if (request.readyState === 4 && request.status === 200) {
                    resolve(request.responseText);
                } else if (request.readyState === 4 && request.status >= 400) {
                    reject(request.responseText);
                }
            };

            request.timeout = 5000;
            request.send(params);
        });
    }
}

module.exports = BlockchainHttp;
