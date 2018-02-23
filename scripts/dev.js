'use strict'

process.env.NODE_ENV = 'development'

const chalk = require('chalk')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const { findAPortNotInUse } = require('portscanner')
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const paths = require('../config/paths')
const createWebpackDevConfig = require('../config/webpack.config.dev')
const createDevServerConfig = require('../config/webpackDevServer.config')

const HOST = '0.0.0.0'
const DEFAULT_PORT = 3000

if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1)
}

findAPortNotInUse(DEFAULT_PORT, null, HOST)
  .then((port) => {
    const compiler = createWebpackDevConfig({ host: HOST, port })
    const serverConfig = createDevServerConfig({ host: HOST })
    const devServer = new WebpackDevServer(webpack(compiler), serverConfig)

    devServer.listen(port, HOST, (err) => {
      if (err) {
        console.log(err)
        return
      }

      console.log(chalk.blue('Starting the development server...\n'))
    })
  })
  .catch((err) => {
    if (err && err.message) {
      console.log(err.message)
    }
    process.exit(1)
  })
