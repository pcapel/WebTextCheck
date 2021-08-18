const path = require('path');

module.exports = {
  entry: {
    index: './src/content/index.js',
    background: './src/background/index.js',
  },
  optimization: {
    minimize: false,
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
};
