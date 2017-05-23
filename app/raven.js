const Raven = require('raven-js');

module.exports = {
    start(retrieveSingle) {
        retrieveSingle('report-errors').then((reportErrors) => {
            if (process.env.NODE_ENV === 'production' && reportErrors) {
                console.log('Starting Raven to watch for errors');
                Raven.config('https://8d9e6a8ea4cd4e618bcc33992838b20b@sentry.fuzzlesoft.ca/8', {
                    stacktrace: true
                }).install();
            }
        });
    },

    stop(retrieveSingle) {
        retrieveSingle('report-errors').then((reportErrors) => {
            if (process.env.NODE_ENV === 'production' && reportErrors) {
                console.log('Disabling Raven');
                Raven.uninstall();
            }
        });
    }
};