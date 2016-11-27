const controller = require('../bitcoin/controller')();
const filter = require('./bitcoin-filter');

document.addEventListener('DOMContentLoaded', () => {
    controller.balance().then((balance) => {
        const amountElement = document.getElementById('pool-amount');
        amountElement.innerHTML = filter(balance);
    });

    chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
        const history = JSON.parse(localStorage.getItem('page-donations') || '[]');
        const currentDonation = history.filter((donation) => donation.url === tabs[0].url)[0] || history[0];
        // ^ Get the last donation with same url as current page. If none exists (e.g. Chrome newTab), just use
        // the last donation information

        const domainElement = document.getElementById('current-domain');
        const donationElement = document.getElementById('current-donation');
        domainElement.innerHTML = currentDonation.domain;
        if (currentDonation.amount) {
            donationElement.innerHTML = filter(currentDonation.amount);
        } else {
            donationElement.innerHTML = 'No bitcoin address';
        }

        const historyTable = document.querySelector('.history tbody');
        history.forEach((pageDonation) => {
            pageDonation.date = new Date(pageDonation.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
            });
            if (pageDonation.amount) {
                pageDonation.amount = filter(pageDonation.amount);
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
            fund.appendChild(document.createTextNode(pageDonation.amount));
            row.appendChild(date);
            row.appendChild(site);
            row.appendChild(fund);
            historyTable.appendChild(row);
        });
    });
});