'use strict'

const path = require('path')
const { dependencies } = require('../package.json')
const webpack = require('webpack')

const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

let preloadConfig = {
  entry: {
    preload: path.join(__dirname, '../src/preload.ts')
  },
  externals: [
    ...Object.keys(dependencies || {})
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        enforce: 'pre',
        use: {
          loader: 'tslint-loader',
          options: {
            configFile: path.join(__dirname, '../tslint.json'),
            failOnHint: false
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            experimentalWatchApi: true
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.node$/,
        use: 'node-loader'
      }
    ]
  },
  node: {
    __dirname: process.env.NODE_ENV !== 'production',
    __filename: process.env.NODE_ENV !== 'production'
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '../dist/electron')
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin()
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.node'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.join(__dirname, '../tsconfig.json')
      })
    ]
  },
  target: 'electron-renderer'
}

/**
 * Adjust preloadConfig for development settings
 */
if (process.env.NODE_ENV !== 'production') {
    preloadConfig.plugins.push(
    new webpack.DefinePlugin({
      '__static': `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`
    })
  )
}

/**
 * Adjust preloadConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
    preloadConfig.plugins.push(
     new UglifyJsPlugin({
       include: /\.js$/g
     }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    })
  )
}

module.exports = preloadConfig
