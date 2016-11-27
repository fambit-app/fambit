var CommonsChunkPlugin = require('webpack').optimize.CommonsChunkPlugin;
var CopyWebpackPlugin = require('copy-webpack-plugin');

var config = {
    entry: {
        'background': './app/extension/background.js',
        'onboard-popup': './app/extension/onboard-popup.js',
        'funded-popup': './app/extension/funded-popup.js',
        'main-popup': './app/extension/main-popup.js'
    },
    module: {
        rules: [
            { test: /\.json$/, loader: 'json-loader' }
        ]
    },
    plugins: [
        new CommonsChunkPlugin({
            name: "commons",
            filename: "commons.js"
        }),
        new CopyWebpackPlugin([
            { from: 'manifest.json' },
            { from: 'resources' }
        ])
    ],
    output: {
        filename: '[name].js',
        path: __dirname + '/dist'
    }
}

module.exports = config;