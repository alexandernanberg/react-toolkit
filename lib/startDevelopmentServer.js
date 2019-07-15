const chalk = require('chalk')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const { findAPortNotInUse } = require('portscanner')
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const paths = require('../config/paths')
const createWebpackConfig = require('../config/webpack.config')
const createDevServerConfig = require('../config/webpackDevServer.config')

const HOST = '0.0.0.0'
const DEFAULT_PORT = 3000

module.exports = async function startDevelopmentServer(options) {
  const { host = HOST } = options
  const port = await findAPortNotInUse(options.port || DEFAULT_PORT, null, host)

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

    console.log(chalk.blue('Starting the development server...\n'))
  })
}
