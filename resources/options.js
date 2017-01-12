let runtime;
if (typeof browser === 'undefined') {
    runtime = chrome;
} else {
    runtime = browser;
}

// Saves options to runtime.storage
function save_options() {
    const donationPercentage = document.getElementById('donation-percentage').value;
    const bannedDomains = [].map.call(document.querySelectorAll('li'), (li) => li.innerHTML);
    runtime.storage.local.set({
        'donation-percentage': donationPercentage,
        'banned-domains': bannedDomains
    }, () => {
        const status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
}

function restore_options() {
    runtime.storage.local.get({
        'banned-domains': [],
        'donation-percentage': 0.0001
    }, function (items) {
        document.getElementById('donation-percentage').value = items['donation-percentage'];
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