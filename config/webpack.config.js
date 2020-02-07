const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin')
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin')
const FriendlyErrorsPlugin = require('../lib/FriendlyWebpackPlugin')
const paths = require('./paths')

const isDev = process.env.NODE_ENV === 'development'

function printSuccessMessage({ host, port }) {
  return [`Ready on http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`]
}

module.exports = ({ host, port, runAnalyzer } = {}) => ({
  mode: isDev ? 'development' : 'production',
  devtool: isDev ? 'cheap-module-source-map' : 'source-map',
  performance: false,
  entry: {
    app: [
      isDev && require.resolve('react-dev-utils/webpackHotDevClient'),
      paths.appIndexJs,
    ].filter(Boolean),
  },
  output: {
    pathinfo: true,
    filename: isDev ? 'scripts/[name].js' : 'scripts/[name].[chunkhash:8].js',
    chunkFilename: isDev
      ? 'scripts/[name].chunk.js'
      : 'scripts/[name].[chunkhash:8].chunk.js',
    publicPath: paths.publicPath,
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.(js|jsx|mjs)$/,
        include: paths.appSrc,
        loader: path.join(__dirname, 'babel-loader.js'),
        options: {
          cacheCompression: false,
          cacheDirectory: true,
        },
      },
    ],
  },
  plugins: [
    isDev && new webpack.HotModuleReplacementPlugin(),
    isDev && new WatchMissingNodeModulesPlugin(paths.appNodeModules),
    new CaseSensitivePathsPlugin(),
    new HtmlWebpackPlugin({
      template: paths.appHtml,
      inject: true,
      minify: !isDev
        ? {
            removeComments: true,
            collapseWhitespace: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeStyleLinkTypeAttributes: true,
            keepClosingSlash: true,
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true,
          }
        : undefined,
    }),
    new InterpolateHtmlPlugin(HtmlWebpackPlugin, { PUBLIC_URL: '' }),
    new FriendlyErrorsPlugin({
      clearConsole: isDev,
      compilationSuccessInfo: isDev
        ? {
            messages: printSuccessMessage({ host, port }),
          }
        : {},
    }),
    runAnalyzer && new BundleAnalyzerPlugin(),
  ].filter(Boolean),
})
