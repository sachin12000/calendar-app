const path = require('path');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const bundleAnalyzerPlugin = new BundleAnalyzerPlugin({
  analyzerHost: 'localhost',
  analyzerPort: 4001,
  openAnalyzer: false
});

module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true
  },
  plugins: [
    bundleAnalyzerPlugin
  ],
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'build-prod'),
  },
};