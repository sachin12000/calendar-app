const path = require('path');

module.exports = {
  mode: 'development',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'build-dev'),
  },
  devtool: "source-map"
};