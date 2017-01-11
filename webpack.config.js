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

function getBuildTimestamp () {
  function pad2 (value) {
    return ('0' + value).slice(-2);
  }
  var date = new Date();
  var timestamp = [
    date.getUTCFullYear(),
    pad2(date.getUTCMonth()+1),
    pad2(date.getUTCDate()),
    pad2(date.getUTCHours()),
    pad2(date.getUTCMinutes()),
    pad2(date.getUTCSeconds())
  ]
  return timestamp.join('');
}

// Minification.
var plugins = [
  new webpack.DefinePlugin({
    'process.env':{
      'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    },
    VERSION: JSON.stringify(require('./package.json').version),
    BUILD_TIMESTAMP: getBuildTimestamp()
  }),
];
if (process.env.NODE_ENV === 'production') {
  plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {warnings: false}
  }));
}

// dist/
var filename = 'aframe-inspector.js';
var outPath = 'dist';
if (process.env.AFRAME_DIST) {
  outPath = 'dist';
  if (process.env.NODE_ENV === 'production') {
    filename = 'aframe-inspector.min.js';
  }
}

module.exports = {
  devServer: {port: 3333},
  entry: entry,
  output: {
    path: path.join(__dirname, outPath),
    filename: filename,
    publicPath: '/dist/'
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
  plugins: plugins,
  postcss: function (webpack) {
    return [
      postcssImport({addDependencyTo: webpack}),  // postcss/postcss-loader/issues/8
      autoprefixer
    ];
  }
};
