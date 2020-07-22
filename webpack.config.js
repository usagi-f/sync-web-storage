const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    path: path.join(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        exclude: /node_modules/,
        use: [{loader: 'babel-loader'}, {loader: 'ts-loader'}],
      },
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.ts']
  },
};