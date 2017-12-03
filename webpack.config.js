const path = require('path');
const webpack = require('webpack');


var injectScript = {
  target: 'web',
  entry: './src/inject.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'inject.js',
    library: 'dfpm',
    libraryTarget: 'window',
    libraryExport: 'default',
  }
}

var extScript = {
  target: 'web',
  entry: {
    content: './src/ext/content.js',
    dfpm_devtools: './src/ext/dfpm_devtools.js',
    dfpm_panel: './src/ext/dfpm_panel.js',
    background: './src/ext/background.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist/ext'),
    filename: '[name].js'
  },
  module: {
    rules: [
      { test: /\.css$/, use: [{loader: 'style-loader'}, {loader:  'css-loader'}]},
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&mimetype=application/font-woff" },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader" },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      Popper: ['popper.js', 'default'],
   })
  ]
}

module.exports = [
  injectScript,
  extScript,
]