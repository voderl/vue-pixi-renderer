const merge = require('webpack-merge');
// const webpack = require('webpack');
const path = require('path');
const {
  CleanWebpackPlugin,
} = require('clean-webpack-plugin');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  // mode: 'development',
  mode: 'production',
  devtool: 'source-map',
  target: 'web',
  output: {
    publicPath: './',
    hashDigestLength: 8,
    filename: '[name].[hash].bundle.js',
    chunkFilename: '[name].[hash].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CleanWebpackPlugin(),
    // new MiniCssExtractPlugin({
    //   filename: '[name].css',
    // }),
    // new webpack.HashedModuleIdsPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
});
