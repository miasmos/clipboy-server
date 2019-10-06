const path = require('path');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: './src/index.js',
    target: 'node',
    node: {
        __dirname: false,
        __filename: true
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js'
    },
    plugins: [new Dotenv(), new webpack.IgnorePlugin(/^pg-native$/)],
    module: {
        rules: [
            { test: /\.js$/, include: [__dirname], exclude: /node_modules/, loader: 'babel-loader' }
        ]
    },
    externals: [nodeExternals()],
    optimization: {
        minimize: false
    }
};
