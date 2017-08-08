const raven = require('../raven');
const {retrieve} = require('../storage');

raven.start(retrieve);
document.addEventListener('DOMContentLoaded', () => {
    const addressElement = document.querySelector('.bitcoin-address');
    retrieve('public-key').then(publicKey => addressElement.innerHTML = publicKey);
});