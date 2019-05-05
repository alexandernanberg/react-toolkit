const arg = require('arg')
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

module.exports = async function dev(argv) {
  const args = arg(
    {
      // Types
      '--help': Boolean,
      '--port': Number,
      '--hostname': String,

      // Aliases
      '-h': '--help',
      '-p': '--port',
      '-H': '--hostname',
    },
    { argv }
  )

  if (args['--help']) {
    console.log(`
Description
  Starts the application in development mode (hot-code reloading, etc)

Usage
  $ react-toolkit dev

Options
  --port, -p      A port number on which to start the application
  --hostname, -H  Hostname on which to start the application
  --help, -h      Displays this message
`)
    process.exit(0)
  }

  if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
    process.exit(1)
  }

  const host = arg['--hostname'] || HOST
  const port = await findAPortNotInUse(
    args['--port'] || DEFAULT_PORT,
    null,
    host
  )

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
