const path = require('path');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const configs = require('./configs.js');

const copyPlugin = new CopyWebpackPlugin({
    patterns: [{
        from: path.join(__dirname, 'src\\client\\assets\\demo.json'), to: ""  // copy the demo data to the build directory
    }]
})

module.exports = (mode) => {
    let config;  // config that will be passed to the app through the DefinePlugin
    let devCss;  // css thst is necessary to hide the emulator warning from Firebase during development
    if (mode === 'development') {
        config = configs.development;
        devCss =
            `<style>
    .firebase-emulator-warning {
      display: none
    }
  </style>`;
    } else if (mode === 'production') {
        config = configs.production;
        devCss = '';
    } else {
        throw new Error('No matching configuration was found!');
    }

    const htmlPlugin = new HtmlWebpackPlugin({
        title: "Calendar",
        template: "./src/client/index.ejs",
        templateParameters: {
            devCss
        }
    })

    const definePlugin = new webpack.DefinePlugin({
        CLIENT_CONFIG_OBJECT: JSON.stringify(config)
    });

    return {
        entry: './src/client/index.tsx',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.(png|svg|jpg|jpeg|gif)$/i,
                    type: 'asset/resource',
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/i,
                    type: 'asset/resource',
                }
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        plugins: [
            definePlugin,
            htmlPlugin,
            copyPlugin
        ],
        devServer: {
            static: {
                directory: path.join(__dirname, 'public'),
            },
            compress: true,
            port: 3000,
        },
    }
};