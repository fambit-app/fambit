module.exports = {
    setIcon: function setIcon(type) {
        const modifier = type === 'normal' ? '' : `${type}-`;

        chrome.browserAction.setIcon({
            path: {
                '16': `icon-${modifier}16.png`,
                '19': `icon-${modifier}19.png`,
                '24': `icon-${modifier}24.png`
            }
        });
    },
    setPopup: function updatePopup(html) {
        chrome.browserAction.setPopup({
            popup: html
        });
    }
};