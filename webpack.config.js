const { merge } = require('webpack-merge');

const commonConfig = require('./webpack.common');
const developmentConfig = require('./webpack.dev');
const productionConfig = require('./webpack.prod');

module.exports = (env, args) => {
    switch (args.mode) {
        case 'development':
            console.log("Running development build");
            return merge(commonConfig('development'), developmentConfig);
        case 'production':
            console.log("Running production build");
            return merge(commonConfig('production'), productionConfig);
        default:
            throw new Error('No matching configuration was found!');
    }
}