var path = require('path');

var autoprefixer = require('autoprefixer');
var postcssImport = require('postcss-import');
var webpack = require('webpack');

// Add HMR for development environments only.
var entry = ['./src/components/Main.js'];
if (process.env.NODE_ENV === 'dev') {
  entry = [
    'webpack-dev-server/client?http://localhost:3333',
    'webpack/hot/only-dev-server'
  ].concat(entry);
}

module.exports = {
  devServer: {port: 3333},
  entry: entry,
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'aframe-editor.js',
    publicPath: '/build/'
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          plugins: ['transform-class-properties'],
          presets: ['es2015', 'react']
        }
      },
      {
        test: /\.css$/,
        loader:'style!css!postcss'
      }
    ]
  },
  postcss: function (webpack) {
    return [
      postcssImport({addDependencyTo: webpack}),  // postcss/postcss-loader/issues/8
      autoprefixer
    ];
  }
};
