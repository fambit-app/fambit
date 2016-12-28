/**
 * Returns a pretty string to display the amount of bitcoins in a convenient unit.
 * @param milliBitcoins formatted
 * @return string to display bitcoin with a maximum of three decimal places.
 */
module.exports = function format(milliBitcoins) {
    const digits = 2;
    if (milliBitcoins < 0.01) {
        return `${(milliBitcoins * 1000).toFixed(digits)} μBTC`;
    } else if (milliBitcoins < 10) {
        return `${(milliBitcoins).toFixed(digits)} mBTC`;
    } else if (milliBitcoins < 10000) {
        return `${(milliBitcoins / 1000).toFixed(digits)} BTC`;
    } else if (milliBitcoins < 10000000) {
        return `${(milliBitcoins / 1000000).toFixed(digits)} kBTC`;
    }
};