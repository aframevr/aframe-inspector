var path = require('path');

module.exports = {
  devServer: {
    hot: true,
    liveReload: false,
    port: 3333,
    static: {
      directory: '.'
    }
  },
  devtool: 'source-map',
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: process.env.MINIFY
      ? 'aframe-inspector.min.js'
      : 'aframe-inspector.js',
    publicPath: '/dist/'
  },
  externals: {
    // Stubs out `import ... from 'three'` so it returns `import ... from window.THREE` effectively using THREE global variable that is defined by AFRAME.
    three: 'THREE'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack']
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.styl$/,
        exclude: /node_modules/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { url: false }
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: ['autoprefixer']
              }
            }
          },
          'stylus-loader'
        ]
      }
    ]
  },
  mode: process.env.MINIFY === 'true' ? 'production' : 'development'
};
