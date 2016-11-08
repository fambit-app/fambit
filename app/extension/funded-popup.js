document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('funded-ok').addEventListener('click', () => {
        console.log('sup');
        localStorage.setItem('onboard-status', 'DONE');
        window.location.href = 'main-popup.html';
    });
});