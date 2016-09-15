const bitcoinFunctions = require('./bitcoinInterface.js');

document.transfer = bitcoinFunctions.transfer;
console.log("I'm the popup!");
