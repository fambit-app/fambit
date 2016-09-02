class BitcoinServerRequests {
    constructor() {

    }

    getBalance(address) {
        const response = this.makeRequest("https://www.blockchain.info/address/" + address + "?format=json");
        if (response) {
            const json = JSON.parse(response.body);
            return json["final_balance"];
        }
    }

    makeRequest(url) {
        const request = new XMLHttpRequest();
        request.open( "GET", url, false);
        request.send();
        return request.responseText;
    }
}

module.exports = BitcoinServerRequests;
