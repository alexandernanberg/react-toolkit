const webpack = require('webpack')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin')
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin')
const { WebpackManifestPlugin } = require('webpack-manifest-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const isDev = process.env.NODE_ENV === 'development'
const isProd = process.env.NODE_ENV === 'production'

module.exports = function createWebpackConfig({
  config,
  isServer = true,
  analyzeBundle = false,
  reactProductionProfiling = false,
}) {
  /**
   * @type import('webpack').Configuration
   */
  const webpackConfig = {
    name: isServer ? 'server' : 'client',
    target: isServer ? 'node' : 'web',
    mode: isDev ? 'development' : 'production',
    stats: 'errors-warnings',
    // devtool: isDev ? 'cheap-module-source-map' : 'source-map',
    // Fail out on the first error instead of tolerating it.
    bail: isProd,
    // Disable performance check since we have custom checks.
    performance: false,
    entry: {
      ...(!isServer && { 'entry.client': config.entryClient }),
      ...(isServer && { 'entry.server': config.entryServer }),
    },
    output: {
      path: isServer
        ? config.serverBuildDirectory
        : config.assetsBuildDirectory,
      pathinfo: isDev,
      library: isServer ? undefined : '_N_E',
      libraryTarget: isServer ? 'commonjs2' : 'assign',
      filename: isServer
        ? '[name].js'
        : `chunks/[name]${isDev ? '' : '.[contenthash]'}.js`,
      chunkFilename: isServer
        ? '[name].js'
        : `chunks/[name]${isDev ? '' : '.[contenthash]'}.js`,
      publicPath: config.publicPath,
    },
    resolve: {
      alias: {
        // Allows for better profiling with ReactDevTools.
        ...(reactProductionProfiling && {
          'react-dom$': 'react-dom/profiling',
          'scheduler/tracing': 'scheduler/tracing-profiling',
        }),
      },
    },
    optimization: {
      // Automatically split vendor and commons.
      splitChunks: isServer ? false : { chunks: 'all' },
      minimize: !isDev,
      emitOnErrors: isProd,
      runtimeChunk: !isServer ? { name: 'webpack-runtime' } : undefined,
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
          include: config.appDirectory,
          exclude: config.nodeModulesDirectory,
          loader: require.resolve('./babel-loader.js'),
          options: {
            isServer,
            plugins: [
              isDev && !isServer && require.resolve('react-refresh/babel'),
            ].filter(Boolean),
            compact: true,
            cacheCompression: false,
            cacheDirectory: true,
          },
        },
        {
          test: /\.(css)$/,
          include: config.appDirectory,
          use: [
            !isServer && MiniCssExtractPlugin.loader,
            require.resolve('css-loader'),
          ].filter(Boolean),
        },
      ],
    },
    plugins: [
      !isServer &&
        new webpack.ProvidePlugin({
          Buffer: [require.resolve('buffer'), 'Buffer'],
          process: [require.resolve('process')],
        }),
      new ModuleNotFoundPlugin(config.rootDirectory),
      // Emit hot updates for Fast Refresh.
      isDev && !isServer && new webpack.HotModuleReplacementPlugin(),
      // Hot reloading for React.
      // https://github.com/facebook/react/tree/master/packages/react-refresh
      isDev &&
        !isServer &&
        new ReactRefreshWebpackPlugin({
          overlay: {
            sockIntegration: 'whm',
          },
        }),
      // Watcher doesn't work well if you mistype casing in a path so we use
      // a plugin that prints an error when you attempt to do this.
      isDev && new CaseSensitivePathsPlugin(),
      // Extract CSS to a separate file only in client build.
      !isServer &&
        new MiniCssExtractPlugin({
          experimentalUseImportModule: true,
          filename: isDev ? 'css/[name].css' : 'css/[name].[contenthash].css',
          chunkFilename: isDev ? 'css/[id].css' : 'css/[id].[contenthash].css',
          ignoreOrder: true,
        }),
      // Generate an asset manifest file with the following content:
      // - "files" key: Mapping of all asset filenames to their corresponding
      //   output file so that tools can pick it up without having to parse
      //   `index.html`
      // - "entrypoints" key: Array of files which are included in `index.html`,
      //   can be used to reconstruct the HTML if necessary
      !isServer &&
        new WebpackManifestPlugin({
          fileName: 'build-manifest.json',
          entrypoints: true,
          contextRelativeKeys: true,
          // generate: (seed, files, entrypoints) => {
          //   const manifestFiles = files.reduce((acc, file) => {
          //     acc[file.name] = file.path
          //     return acc
          //   }, seed)
          //   const entrypointFiles = entrypoints.app.filter(
          //     (fileName) => !fileName.endsWith('.map')
          //   )

          //   return {
          //     files: manifestFiles,
          //     entrypoints: entrypointFiles,
          //   }
          // },
        }),
      // If you require a missing module and then `npm install` it, you still have
      // to restart the development server for webpack to discover it. This plugin
      // makes the discovery automatic so you don't have to restart.
      isDev &&
        !isServer &&
        new WatchMissingNodeModulesPlugin(config.nodeModulesDirectory),
      // Visual and interactive bundle analyzer in the browser.
      !isServer && analyzeBundle && new BundleAnalyzerPlugin(),
    ].filter(Boolean),
  }

  if (config.webpack) {
    return config.webpack(webpackConfig)
  }

  return webpackConfig
}
