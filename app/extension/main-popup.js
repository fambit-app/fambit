const controller = require('../bitcoin/controller')();

document.addEventListener('DOMContentLoaded', () => {
    controller.balance().then((balance) => {
        const amountElement = document.getElementById('pool-amount');
        amountElement.innerHTML = `${Math.round(balance / 100)} μBTC`;
    });

    const lastDonation = JSON.parse(localStorage.getItem('last-page-donation'));
    const domainElement = document.getElementById('current-domain');
    const donationElement = document.getElementById('current-donation');
    domainElement.innerHTML = lastDonation.domain;
    if (lastDonation.amount) {
        donationElement.innerHTML = `${Math.round(lastDonation.amount)}sat.`;
    } else {
        donationElement.innerHTML = 'No bitcoin address';
    }

    const historyTable = document.querySelector('.history tbody');
    const history = JSON.parse(localStorage.getItem('page-donations') || '[]');
    history.forEach((pageDonation) => {
        pageDonation.date = new Date(pageDonation.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        });
        if (pageDonation.amount) {
            pageDonation.amount = `${Math.round(pageDonation.amount)}sat.`;
        } else {
            pageDonation.amount = 'none';
        }

        const row = document.createElement('tr');
        const date = document.createElement('td');
        date.appendChild(document.createTextNode(pageDonation.date));
        const site = document.createElement('td');
        site.title = pageDonation.url;
        site.appendChild(document.createTextNode(pageDonation.domain));
        const fund = document.createElement('td');
        fund.appendChild(document.createTextNode(`${pageDonation.amount}`));
        row.appendChild(date);
        row.appendChild(site);
        row.appendChild(fund);
        historyTable.appendChild(row);
    });
});