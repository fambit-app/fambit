//Instantiate BitcoinTransfer to begin building a list of inputs and outputs
class BitcoinTransfer {

    constructor(myAddress) {
        this.myAddress = myAddress;
        this.inputs = [];
        this.outputs = [];
        this.currentInputValue = 0;
        this.PERCENTAGE_CONSTANT = 0.2;
        this.THRESHOLD = 0.000001;
    }

    addInput(input) {
        if (!('tx' in input) || !('index' in input) || !('value' in input)) {
            console.log('ERROR : input should be defined as {tx, index, value}');
            return;
        }

        //Send dust from previous transaction back to user's address
        this.outputs.add({recipient: this.myAddress, amount: this.currentInputValue});

        this.currentInputValue = input.value;
        this.inputs.add(input);
    }

    addOutput(address) {
        //Get amount to add based on the percentage to add
        const amount = this.currentInputValue - (this.currentInputValue * this.PERCENTAGE_CONSTANT);
        this.currentInputValue -= amount;
        this.outputs.add({recipient: address, amount});
    }

    sufficientInput() {
        return this.currentInputValue - (this.currentInputValue * this.PERCENTAGE_CONSTANT) >= this.THRESHOLD;
    }
}
module.exports = BitcoinTransfer;
