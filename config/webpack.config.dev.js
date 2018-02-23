const webpack = require('webpack')
const HtmlWebpackPLugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin')
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin')
const babelConfig = require('./babel')
const paths = require('./paths')

module.exports = ({ host, port }) => ({
  devtool: 'cheap-module-inline-source-map',
  entry: {
    app: [require.resolve('react-dev-utils/webpackHotDevClient'), paths.appIndexJs],
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
        options: {
          cacheDirectory: true,
          babelrc: false,
          ...babelConfig,
        },
      },
    ],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new CaseSensitivePathsPlugin(),
    new FriendlyErrorsPlugin({
      compilationSuccessInfo: {
        messages: [`Ready on http://${host}:${port}`],
      },
    }),
    new WatchMissingNodeModulesPlugin(paths.appNodeModules),
    new InterpolateHtmlPlugin({ PUBLIC_URL: '' }),
    new HtmlWebpackPLugin({
      template: paths.appHtml,
      inject: true,
    }),
  ],
})
