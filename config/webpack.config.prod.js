const webpack = require('webpack')
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const HtmlWebpackPLugin = require('html-webpack-plugin')
const WorkboxPlugin = require('workbox-webpack-plugin')
const babelConfig = require('./babel')
const paths = require('./paths')

module.exports = {
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
        options: {
          cacheDirectory: true,
          babelrc: false,
          ...babelConfig,
        },
      },
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin({ NODE_ENV: 'production' }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'common',
      minChunks: module => module.context && module.context.indexOf('node_modules') !== -1,
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity,
    }),
    new FriendlyErrorsPlugin(),
    new InterpolateHtmlPlugin({ PUBLIC_URL: '' }),
    new HtmlWebpackPLugin({
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
    new webpack.optimize.UglifyJsPlugin(),
    new WorkboxPlugin.GenerateSW(),
  ],
}
