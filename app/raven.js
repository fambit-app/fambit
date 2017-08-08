const FALSE = false; // If I don't have "|| FALSE", webpack doesn't process the "import" statements

module.exports = {
    start() {
        if (process.env.NODE_ENV === 'production' || FALSE) {
            console.log('Starting Raven to watch for errors');
            import(/* webpackChunkName "Raven" */ 'raven-js').then((Raven) => {
                Raven.config('https://8d9e6a8ea4cd4e618bcc33992838b20b@sentry.fuzzlesoft.ca/8', {
                    stacktrace: true
                }).install();
            });
        }
    },

    stop() {
        if (process.env.NODE_ENV === 'production' || FALSE) {
            console.log('Disabling Raven');
            import(/* webpackChunkName "Raven" */ 'raven-js').then(Raven => Raven.uninstall());
        }
    }
};