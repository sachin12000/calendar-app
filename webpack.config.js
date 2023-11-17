const { merge } = require('webpack-merge');

const commonConfig = require('./webpack.common');
const developmentConfig = require('./webpack.dev');
const productionConfig = require('./webpack.prod');

module.exports = (env, args) => {
    console.log(args.mode)
    switch (args.mode) {
        case 'development':
            return merge(commonConfig('development'), developmentConfig);
        case 'production':
            return merge(commonConfig('production'), productionConfig);
        default:
            throw new Error('No matching configuration was found!');
    }
}