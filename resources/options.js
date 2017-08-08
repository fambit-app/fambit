function save_options() {
    const donationPercentage = document.getElementById('donation-percentage').value;
    const reportErrors = document.getElementById('report-errors').checked;
    const bannedDomains = [].map.call(document.querySelectorAll('li'), (li) => li.innerHTML);
    chrome.storage.sync.set({
        'donation-percentage': donationPercentage,
        'report-errors': reportErrors,
        'banned-domains': bannedDomains
    }, () => {
        const status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function () {
            status.textContent = '';
        }, 750);

        chrome.runtime.sendMessage({
            action: 'CHANGED_OPTIONS',
            donationPercentage,
            reportErrors,
            bannedDomains
        });
    });
}

function restore_options() {
    chrome.storage.sync.get([
        'donation-percentage',
        'report-errors',
        'banned-domains'
    ], function (items) {
        console.log('report-errors: ' + items['report-errors']);
        document.getElementById('donation-percentage').value = items['donation-percentage'];
        document.getElementById('report-errors').checked = items['report-errors'];
        const bannedDomains = document.getElementById('banned-domains');
        if (items['banned-domains'].length > 0) {
            bannedDomains.innerHTML = '';
            items['banned-domains'].forEach((domain) => {
                const li = document.createElement('li');
                li.appendChild(document.createTextNode(domain));
                bannedDomains.appendChild(li);

                li.addEventListener('click', function() {
                    li.remove();
                    if (bannedDomains.firstChild === null) {
                        bannedDomains.appendChild(document.createTextNode('(none)'));
                    }
                });
            })
        }

    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);