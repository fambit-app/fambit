class BitcoinServerRequests {

    getBalance(address) {
        const promise = this._getRequest('GET', `https://www.blockchain.info/address/${address}?format=json`);

        promise.then(
            (val) => {
                const json = JSON.parse(val.body);
                return json.final_balance;
            }
        )
        .catch(
            () => -1
        );
    }

    getTransactionList(address) {
        const promise = this._getRequest(`https://www.blockchain.info/unspent?active=${address}`);

        promise.then(
            (val) => {
                const json = JSON.parse(val.body);
                return json.unspent_outputs;
            }
        )
        .catch(
            () => []
        );
    }


    submitTransaction(hash) {
        this._postRequest('POST', 'https://www.blockchain.info/pushtx', `tx=${hash}`);
    }

    _getRequest(url) {
        return new Promise(
            (resolve, reject) => {
                const request = new XMLHttpRequest();
                request.open('GET', url, true);

                request.onreadystatechange = function () {
                    if (request.readyState === 4 && request.status === 200) {
                        resolve(request.responseText);
                    } else if (request.readyState === 4 && request.status >= 400) {
                        reject(request.responseText);
                    }
                };

                request.timeout = 5000;
                request.send();
            }
        );
    }

    _postRequest(url, params) {
        return new Promise(
            (resolve, reject) => {
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
            }
        );
    }
}

module.exports = BitcoinServerRequests;
