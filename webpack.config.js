module.exports = {
  entry: "./src/components/Main.js",
  output: {
    filename: "build/aframe-editor.js",
  },
  devServer: {
    inline: true,
    port: 3333
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets: ['es2015', 'react']
        }
      },
      {
        test: /\.css$/,
        loader:'style!css!'
      }
    ]
  }
};
