const webpack = require('webpack');
const { nextI18NextRewrites } = require('next-i18next/rewrites')

const localeSubpaths = {
    de: 'de'
};

module.exports = {
    rewrites: async () => nextI18NextRewrites(localeSubpaths),
    publicRuntimeConfig: {
        localeSubpaths,
    },
    module: {
        rules: [
            { test: /\.(png|jpeg)$/, loader: 'raw-loader' }
        ]
    },
}