const InterpolateHtmlPlugin = require('./Plugins/InterpolateHtmlPlugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const HtmlWebpackPLugin = require('html-webpack-plugin')
const WorkboxPlugin = require('workbox-webpack-plugin')
const getBabelConfig = require('./getBabelConfig')
const paths = require('./paths')

module.exports = {
  mode: 'production',
  devtool: 'sourcemap',
  entry: {
    app: [paths.appIndexJs],
  },
  output: {
    path: paths.appBuild,
    filename: 'scripts/[name].[chunkhash:8].js',
    chunkFilename: 'scripts/[name].[chunkhash:8].chunk.js',
    publicPath: paths.servedPath,
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
    new HtmlWebpackPlugin({
      template: paths.appHtml,
      inject: true,
      minify: {
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
      },
    }),
    new InterpolateHtmlPlugin({ PUBLIC_URL: '' }),
    new WorkboxPlugin.InjectManifest({
      swSrc: paths.appServiceWorker,
    }),
    new FriendlyErrorsPlugin(),
  ],
}
