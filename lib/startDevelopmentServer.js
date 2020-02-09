/* eslint-disable no-console */
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const { findAPortNotInUse } = require('portscanner')
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const clearConsole = require('react-dev-utils/clearConsole')
const paths = require('../config/paths')
const createWebpackConfig = require('../config/webpack.config')
const createDevServerConfig = require('../config/webpackDevServer.config')
const output = require('../lib/FriendlyOutputWebpackPlugin/src/output')
const { loadConfig } = require('../config/config')

const isInteractive = process.stdout.isTTY

const HOST = '0.0.0.0'
const DEFAULT_PORT = 3000

module.exports = async function startDevelopmentServer(options) {
  const { host = HOST } = options

  const port = await findAPortNotInUse(options.port || DEFAULT_PORT, null, host)
  const config = await loadConfig()

  if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
    process.exit(1)
  }

  const compiler = createWebpackConfig({ host, port })
  const serverConfig = createDevServerConfig({ host })
  const devServer = new WebpackDevServer(webpack(compiler), serverConfig)

  devServer.listen(port, host, err => {
    if (err) {
      console.log(err)
      return
    }

    if (isInteractive) {
      clearConsole()
    }

    // console.log(settings({ isDev: true }))

    output.title('info', 'wait', 'Starting the development server...')
  })
}
