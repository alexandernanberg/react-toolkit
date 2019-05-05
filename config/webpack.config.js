const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin')
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin')
const paths = require('./paths')

const isDev = process.env.NODE_ENV === 'development'

module.exports = ({ host, port } = {}) => ({
  mode: isDev ? 'development' : 'production',
  devtool: isDev ? 'cheap-module-source-map' : 'sourcemap',
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
    rules: [
      {
        test: /\.(js|jsx|mjs)$/,
        include: paths.appSrc,
        loader: path.join(__dirname, 'babel-loader.js'),
        options: {
          cacheDirectory: true,
          babelrc: false,
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
      compilationSuccessInfo: isDev
        ? {
            messages: [
              `Ready on http://${
                host === '0.0.0.0' ? 'localhost' : host
              }:${port}`,
            ],
          }
        : {},
    }),
  ].filter(Boolean),
})
