document.addEventListener('DOMContentLoaded', () => {
    const mockData = [{
        date: '2016-08-01',
        site: 'bustanut.xyz/index.html',
        donation: 0.011
    }, {
        date: '2016-07-28',
        site: 'fuzzlesoft.ca/phazeball2/A_0.3.2_2/index.html',
        donation: 0.012
    }, {
        date: '2016-07-28',
        site: 'fuzzlesoft.ca/phazeball2/index.html',
        donation: 0.012
    }, {
        date: '2016-07-28',
        site: 'fuzzlesoft.ca/projects.html',
        donation: 0.012
    }, {
        date: '2016-07-28',
        site: 'fuzzlesoft.ca/about.html',
        donation: 0.012
    }, {
        date: '2016-07-28',
        site: 'fuzzlesoft.ca/index.html',
        donation: 0.012
    }, {
        date: '2016-07-26',
        site: 'www.lukeatsea.com/dda2',
        donation: 0.013
    }];

    const historyTable = document.querySelector('.history tbody');
    mockData.forEach((donation) => {
        const row = document.createElement('tr');
        const date = document.createElement('td');
        date.appendChild(document.createTextNode(donation.date));
        const site = document.createElement('td');
        site.title = donation.site;
        site.appendChild(document.createTextNode(donation.site.split('/')[0]));
        const fund = document.createElement('td');
        fund.appendChild(document.createTextNode(`${donation.donation}BC`));
        row.appendChild(date);
        row.appendChild(site);
        row.appendChild(fund);
        historyTable.appendChild(row);
    });
});