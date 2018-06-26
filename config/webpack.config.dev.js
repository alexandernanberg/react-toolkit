const webpack = require('webpack')
const HtmlWebpackPLugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const InterpolateHtmlPlugin = require('./Plugins/InterpolateHtmlPlugin')
// const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin')
const paths = require('./paths')
const getBabelConfig = require('../utils/getBabelConfig')

module.exports = ({ host, port }) => ({
  mode: 'development',
  devtool: 'cheap-module-source-map',
  entry: {
    app: [
      require.resolve('react-dev-utils/webpackHotDevClient'),
      paths.appIndexJs,
    ],
  },
  output: {
    pathinfo: true,
    filename: 'scripts/[name].js',
    chunkFilename: 'scripts/[name].chunk.js',
    publicPath: paths.publicPath,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|mjs)$/,
        include: paths.appSrc,
        loader: require.resolve('babel-loader'),
        options: getBabelConfig(process.cwd()),
      },
    ],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new CaseSensitivePathsPlugin(),
    // new WatchMissingNodeModulesPlugin(paths.appNodeModules),
    new HtmlWebpackPLugin({
      template: paths.appHtml,
      inject: true,
    }),
    new InterpolateHtmlPlugin({ PUBLIC_URL: '' }),
    new FriendlyErrorsPlugin({
      compilationSuccessInfo: {
        messages: [
          `Ready on http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`,
        ],
      },
    }),
  ],
})
