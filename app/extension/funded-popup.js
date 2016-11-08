document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('funded-ok').addEventListener('click', function() {
        console.log('sup');
        localStorage.setItem('onboard-status', 'DONE');
        window.location.href = 'main-popup.html';
    });
});