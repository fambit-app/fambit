const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const config = {
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
        new CopyWebpackPlugin([
            { from: 'manifest.json' },
            { from: 'resources' }
        ])
    ],
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        chunkFilename: '[name].bundle.js'
    },
    devtool: 'inline-source-map'
};

module.exports = (env) => {
    if (env.prod === 'true') {
        config.plugins.push(new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }));
    } else {
        config.plugins.push(new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('development')
            }
        }));
    }
    return config;
};