/* eslint-disable no-console */
process.env.NODE_ENV = 'development'
process.env.BABEL_ENV = 'development'

const arg = require('arg')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const { prepareUrls } = require('react-dev-utils/WebpackDevServerUtils')
const clearConsole = require('react-dev-utils/clearConsole')
const paths = require('../config/paths')
const createWebpackConfig = require('../config/webpack.config')
const createDevServerConfig = require('../config/webpackDevServer.config')
const { loadConfig } = require('../config/config')
const createDevCompiler = require('../lib/createDevCompiler')

const isInteractive = process.stdout.isTTY

const HOST = '0.0.0.0'
const PORT = 3000

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

  const host = args['--hostname'] || HOST
  const port = args['--port'] || PORT

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

    console.log('Starting the development server...\n')
  })
}
