/* eslint-disable no-console */
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const { prepareUrls } = require('react-dev-utils/WebpackDevServerUtils')
const clearConsole = require('react-dev-utils/clearConsole')
const chalk = require('react-dev-utils/chalk')
const paths = require('../config/paths')
const createWebpackConfig = require('../config/webpack.config')
const createDevServerConfig = require('../config/webpackDevServer.config')
const { loadConfig } = require('../config/config')
const createDevCompiler = require('./createDevCompiler')

const isInteractive = process.stdout.isTTY

const HOST = '0.0.0.0'
const DEFAULT_PORT = 3000

module.exports = async function startDevServer(options) {
  const { host = HOST } = options

  const port = options.port || DEFAULT_PORT
  const config = await loadConfig()

  if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
    process.exit(1)
  }

  const urls = prepareUrls('http', host, port, paths.publicPath.slice(0, -1))
  const webpackConfig = createWebpackConfig({}, config)
  const serverConfig = createDevServerConfig(urls.lanUrlForConfig)
  const compiler = createDevCompiler({ config: webpackConfig, webpack, urls })
  const devServer = new WebpackDevServer(compiler, serverConfig)

  devServer.listen(port, host, (err) => {
    if (err) {
      console.log(err)
      return
    }

    if (isInteractive) {
      clearConsole()
    }

    console.log(chalk.cyan('Starting the development server...'))
  })
}
