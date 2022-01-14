var autoprefixer = require('autoprefixer');
var childProcess = require('child_process');
var path = require('path');
var postcssImport = require('postcss-import');
var TerserPlugin = require('terser-webpack-plugin-legacy');
var webpack = require('webpack');

// Add HMR for development environments only.
var entry = ['./src/index.js'];
if (process.env.NODE_ENV === 'dev') {
  entry = [
    'webpack-dev-server/client?http://localhost:3333'
    // 'webpack/hot/only-dev-server'
  ].concat(entry);
}

function getBuildTimestamp () {
  function pad2 (value) {
    return ('0' + value).slice(-2);
  }
  var date = new Date();
  var timestamp = [
    pad2(date.getUTCDate()),
    pad2(date.getUTCMonth()+1),
    date.getUTCFullYear()
  ]
  return timestamp.join('-');
}

var commitHash = childProcess.execSync('git rev-parse HEAD').toString();

// Minification.
var plugins = [
  new webpack.DefinePlugin({
    'process.env':{
      'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    },
    VERSION: JSON.stringify(require('./package.json').version),
    BUILD_TIMESTAMP: JSON.stringify(getBuildTimestamp()),
    COMMIT_HASH: JSON.stringify(commitHash)

  }),
  new webpack.EnvironmentPlugin(['NODE_ENV'])
];
if (process.env.MINIFY === 'true') {
  plugins.push(new TerserPlugin());
}

// dist/
var filename = 'aframe-inspector.js';
var outPath = 'dist';
if (process.env.AFRAME_DIST) {
  outPath = 'dist';
  if (process.env.MINIFY) {
    filename = 'aframe-inspector.min.js';
  }
}

module.exports = {
  devServer: {
    disableHostCheck: true,
    port: 3333
  },
  devtool: 'source-map',
  entry: entry,
  output: {
    path: path.join(__dirname, outPath),
    filename: filename,
    publicPath: '/dist/'
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        loader:'style-loader!css-loader!postcss-loader'
      },
      {
        test: /\.styl$/,
        exclude: /(node_modules)/,
        loaders: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {url: false}
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: (loader) => [require('autoprefixer')()]
            }
          },
          'stylus-loader'
        ]
      }
    ]
  },
  plugins: plugins,
  resolve: {
    modules: [path.join(__dirname, 'node_modules')]
  }
};
