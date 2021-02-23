'use strict'

const path = require('path')

const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    app: './webpack-src/js/app.js',
    echarts: './webpack-src/js/echarts.js'
  },
  optimization: {
    minimize: true
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      Popper: ['popper.js', 'default'],
    }),
    new MiniCssExtractPlugin({
      filename: '[name].bundle.css'
    })
  ],
  output: {
    publicPath: '/assets-wp/',
    path: path.join(__dirname, '/dist/'),
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      { 
        test: /\.js$/, 
        loader: 'babel-loader', 
        exclude: /(node_modules)/, 
        options: { presets: ['env'] } },
      {
        test: /\.(scss)$/,
        use: [{
          loader: 'style-loader', // inject CSS to page
        }, {
          loader: 'css-loader', // translates CSS into CommonJS modules
        }, {
          loader: 'postcss-loader', // Run post css actions
          options: {
            plugins: function () { // post css plugins, can be exported to postcss.config.js
              return [
                require('precss'),
                require('autoprefixer')
              ]
            }
          }
        }, {
          loader: 'sass-loader' // compiles SASS to CSS
        }]
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      { 
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, 
        loader: 'file' 
      },
      { 
        test: /\.(woff|woff2)$/, 
        use: ['url-loader', 
        { options: 
          { 
            limit: 5000
          } 
        } ] 
      },
      { 
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, 
        use: [{
          loader: 'url-loader', 
          options: { 
            limit: 10000, 
            mimetype: 'application/octet-stream' 
          } 
        }] 
      },
      { 
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, 
        use: [{
          loader: 'url-loader', 
          options: { 
            limit: 10000, 
            mimetype: 'image/svg+xml' 
          } 
        }] 
      },
      {
        test: require.resolve('jquery'),
        use: [{
          loader: 'expose-loader',
          options: {
            exposes: ['$','jQuery']
          }
        }]
      },
      {
        test: require.resolve('./webpack-src/js/echarts.js'),
        use: [{
          loader: 'expose-loader',
          options: {
            exposes: ['echarts']
          }
        }]
      }
    ],
  },
}
