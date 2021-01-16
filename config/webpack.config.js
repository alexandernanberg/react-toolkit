const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin')
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin')
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin')
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin')
const paths = require('./paths')

const webpackDevClientEntry = require.resolve(
  'react-dev-utils/webpackHotDevClient'
)

const isDev = process.env.NODE_ENV === 'development'
const isProd = process.env.NODE_ENV === 'production'

module.exports = function createWebpackConfig({ runAnalyzer, profile }) {
  const isProdProfile = isProd && profile

  return {
    mode: isDev ? 'development' : 'production',
    devtool: isDev ? 'cheap-module-source-map' : 'source-map',
    // Fail out on the first error instead of tolerating it.
    bail: isProd,
    // Disable performance check since we have custom checks.
    performance: false,
    entry: {
      app: paths.appIndexJs,
    },
    output: {
      path: isProd ? paths.appBuild : undefined,
      pathinfo: isDev,
      filename: isDev
        ? 'scripts/[name].js'
        : 'scripts/[name].[contenthash:8].js',
      chunkFilename: isDev
        ? 'scripts/[name].chunk.js'
        : 'scripts/[name].[contenthash:8].chunk.js',
      publicPath: paths.publicPath,
      // Remove once we use webpack 5 since it will be the default.
      futureEmitAssets: true,
    },
    resolve: {
      alias: {
        // Allows for better profiling with ReactDevTools.
        ...(isProdProfile && {
          'react-dom$': 'react-dom/profiling',
          'scheduler/tracing': 'scheduler/tracing-profiling',
        }),
      },
    },
    optimization: {
      // Automatically split vendor and commons.
      splitChunks: {
        chunks: 'all',
      },
      // Keep the runtime chunk separated to enable long term caching.
      runtimeChunk: {
        name: (entrypoint) => `webpack-runtime-${entrypoint.name}`,
      },
    },
    module: {
      // Make missing exports an error instead of a warning.
      strictExportPresence: true,
      rules: [
        // Disable require.ensure as it's not a standard language feature.
        { parser: { requireEnsure: false } },
        // Process application JS with Babel.
        {
          test: /\.(js|mjs)$/,
          include: paths.appSrc,
          loader: require.resolve('./babel-loader.js'),
          options: {
            plugins: [isDev && require.resolve('react-refresh/babel')].filter(
              Boolean
            ),
            cacheCompression: false,
            cacheDirectory: true,
          },
        },
      ],
    },
    plugins: [
      // Generates an `index.html` file with the <script> injected.
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
      // Inlines the webpack runtime script. This script is too small to warrant
      // a network request.
      isProd &&
        new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [
          /webpack-runtime-.+[.]js/,
        ]),
      // This gives some necessary context to module not found errors, such as
      // the requesting resource.
      new ModuleNotFoundPlugin(paths.appPath),
      // This is necessary to emit hot updates (Fast Refresh).
      isDev && new webpack.HotModuleReplacementPlugin(),
      // Hot reloading for React.
      // https://github.com/facebook/react/tree/master/packages/react-refresh
      isDev &&
        new ReactRefreshWebpackPlugin({
          overlay: {
            entry: webpackDevClientEntry,
            // The expected exports are slightly different from what the overlay exports,
            // so an interop is included here to enable feedback on module-level errors.
            module: require.resolve('react-dev-utils/refreshOverlayInterop'),
            // Since we ship a custom dev client and overlay integration,
            // the bundled socket handling logic can be eliminated.
            sockIntegration: false,
          },
        }),
      // Watcher doesn't work well if you mistype casing in a path so we use
      // a plugin that prints an error when you attempt to do this.
      isDev && new CaseSensitivePathsPlugin(),
      // If you require a missing module and then `npm install` it, you still have
      // to restart the development server for webpack to discover it. This plugin
      // makes the discovery automatic so you don't have to restart.
      isDev && new WatchMissingNodeModulesPlugin(paths.appNodeModules),
      // Visual and interactive bundle analyzer in the browser.
      runAnalyzer && new BundleAnalyzerPlugin(),
    ].filter(Boolean),
  }
}
