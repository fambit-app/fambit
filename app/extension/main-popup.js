const controller = require('../bitcoin/controller')();
const format = require('./bitcoin-format');

let runtime;
if (typeof browser === 'undefined') {
    runtime = chrome;
} else {
    runtime = browser;
}

function renderHistory(history) {
    const historyTable = document.querySelector('.history tbody');
    while (historyTable.firstChild) {
        historyTable.removeChild(historyTable.firstChild);
    }

    history.forEach((pageDonation) => {
        const donationDate = new Date(pageDonation.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        });

        const row = document.createElement('tr');
        const date = document.createElement('td');
        date.appendChild(document.createTextNode(donationDate));
        const site = document.createElement('td');
        site.title = pageDonation.url;
        site.appendChild(document.createTextNode(pageDonation.domain));
        const fund = document.createElement('td');
        if (pageDonation.amount) {
            fund.appendChild(document.createTextNode(format(pageDonation.amount)));
        } else {
            fund.appendChild(document.createTextNode('none'));
            fund.title = pageDonation.reason;
        }
        row.appendChild(date);
        row.appendChild(site);
        row.appendChild(fund);
        historyTable.appendChild(row);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Add listener for settings button
    const settingsElement = document.getElementById('settings');
    settingsElement.addEventListener('click', () => runtime.runtime.openOptionsPage());

    // Set up bottom bar with bitcoin amount and address
    const amountContainer = document.getElementsByClassName('amount')[0];
    const addressElement = document.getElementById('bitcoin-address');
    addressElement.innerHTML = controller.publicKey();
    controller.balance().then((balance) => {
        const amountElement = document.getElementById('pool-amount');
        if (balance === undefined) {
            const reportLink = document.createElement('a');
            reportLink.href = 'https://github.com/fambit-app/fambit/issues';
            reportLink.target = '_blank';
            reportLink.innerHTML = 'Report this bug!';
            amountContainer.classList.add('error');
            amountElement.innerHTML = 'Unknown balance. ';
            amountElement.appendChild(reportLink);
        } else {
            amountContainer.classList.remove('error');
            amountElement.innerHTML = format(balance);
        }
    });

    const history = JSON.parse(localStorage.getItem('page-views') || '[]');
    renderHistory(history);
    chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
        const currentDonation = history.filter((donation) => donation.url === tabs[0].url)[0] || history[0];
        // ^ Get the last donation with same url as current page. If none exists (e.g. Chrome newTab), just use
        // the last donation information

        // Set up current domain/pending donation information
        const domainElement = document.getElementById('current-domain');
        const donationElement = document.getElementById('current-donation');
        const banDomainElement = document.getElementById('ban-domain');
        const cancelDonationElement = document.getElementById('cancel-donation');
        const bannedDomains = JSON.parse(localStorage.getItem('banned-domains') || '[]');
        domainElement.innerHTML = currentDonation.domain;
        if (bannedDomains.indexOf(currentDonation.domain) === -1) {
            // Control to ban domain
            banDomainElement.className = 'enabled';
            banDomainElement.title = 'Banning a domain will stop all donations (including pending donations) to any pages on this website';
            banDomainElement.addEventListener('click', function banDomain() {
                if (bannedDomains.indexOf(currentDonation.domain) === -1) {
                    bannedDomains.push(currentDonation.domain);

                    console.log('rekt storage', bannedDomains);
                    runtime.storage.sync.set({'banned-domains': bannedDomains});
                    localStorage.setItem('banned-domains', JSON.stringify(bannedDomains));
                    const pendingDonations = JSON.parse(localStorage.getItem('pending-donations') || '[]');
                    localStorage.setItem('pending-donations', JSON.stringify(pendingDonations.filter((donation) => donation.domain !== currentDonation.domain)));

                    history
                        .filter((view) => view.domain === currentDonation.domain)
                        .forEach((view) => {
                            view.amount = undefined;
                            view.reason = 'Domain banned';
                        });
                    localStorage.setItem('page-views', JSON.stringify(history));
                    banDomainElement.className = undefined;
                    banDomainElement.removeEventListener('click', banDomain);
                    renderHistory(history);
                }

                domainElement.innerHTML = 'Domain banned';
            });

            if (currentDonation.amount) {
                donationElement.innerHTML = format(currentDonation.amount);

                // Control to cancel last donation
                cancelDonationElement.className = 'enabled';
                cancelDonationElement.title = 'Cancelling this donation stops the microdonation for this visit';
                cancelDonationElement.addEventListener('click', function cancelDonation() {
                    const pendingDonations = JSON.parse(localStorage.getItem('pending-donations') || '[]');
                    const withoutCancelled = pendingDonations.filter((donation) => currentDonation.date !== donation.date);
                    localStorage.setItem('pending-donations', JSON.stringify(withoutCancelled));
                    currentDonation.amount = undefined;
                    currentDonation.reason = 'Donation cancelled';
                    localStorage.setItem('page-views', JSON.stringify(history));

                    donationElement.innerHTML = 'Donation cancelled';
                    cancelDonationElement.className = undefined;
                    cancelDonationElement.removeEventListener('click', cancelDonation);
                    renderHistory(history);
                });
            } else {
                donationElement.innerHTML = 'No bitcoin address';
                cancelDonationElement.title = 'This site does not support Fambit, so no donation could be made';
            }
        } else {
            donationElement.innerHTML = 'No donation (banned)';
            banDomainElement.title = 'Cannot ban already-banned domain';
            cancelDonationElement.title = 'This site is banned, so no donation was made';
        }
    });
});