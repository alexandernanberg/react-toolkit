/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-console */
process.env.NODE_ENV = 'development'
process.env.BABEL_ENV = 'development'

const arg = require('arg')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const express = require('express')
const compression = require('compression')
const path = require('path')
const { patchRequire } = require('fs-monkey')
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const { prepareUrls } = require('react-dev-utils/WebpackDevServerUtils')
const clearConsole = require('react-dev-utils/clearConsole')
const paths = require('../config/paths')
const createWebpackConfig = require('../config/webpack-config')
const { loadConfig } = require('../config/config')
const { createCompiler } = require('../lib/webpack-dev-utils')
const { createRequestHandler } = require('../express')

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

  if (!checkRequiredFiles([paths.appServer, paths.appClient])) {
    process.exit(1)
  }

  const urls = prepareUrls('http', host, port, paths.publicPath.slice(0, -1))

  const compilerConfig = [
    createWebpackConfig({
      isServer: true,
      config,
    }),
    createWebpackConfig({
      isServer: false,
      config,
    }),
  ]

  const compiler = createCompiler({ config: compilerConfig, webpack, urls })

  function expressReqToRequest(req) {
    const headers = new Headers(Object.entries(req.headers))
    return new Request(req.url, { headers, method: req.method })
  }

  const app = express()

  app.use(
    webpackDevMiddleware(compiler, {
      serverSideRender: true,
      publicPath: '/_build/',
    })
  )
  app.use(webpackHotMiddleware(compiler.compilers[1], { log: false }))

  app.use(async (req, res) => {
    const { devMiddleware } = res.locals.webpack
    const { outputFileSystem, stats } = devMiddleware
    const jsonWebpackStats = stats.toJson()
    const { assetsByChunkName, outputPath } = jsonWebpackStats

    patchRequire(outputFileSystem)

    const entryServerPath = path.join(paths.appBuild, 'entry-server.js')
    const buildManifestPath = path.join(paths.appBuild, 'build-manifest.json')

    // Clear require cache to get the fresh file
    delete require.cache[require.resolve(entryServerPath)]
    const requestHandler = require(entryServerPath).default

    delete require.cache[require.resolve(buildManifestPath)]
    const buildManifest = require(buildManifestPath)

    try {
      const request = expressReqToRequest(req)

      // // TODO: Clean this up
      // if (request.url.startsWith('/_build/')) {
      //   res
      //     .status(200)
      //     .type('js')
      //     .send(
      //       outputFileSystem.readFileSync(
      //         path.join(paths.appBuild, req.url.replace('/_build', ''))
      //       )
      //     )
      //   return
      // }

      const response = await requestHandler(request, 200, new Headers(), {
        buildManifest,
      })

      const markup = await response.text()
      res
        .status(response.status)
        .set(Object.fromEntries(response.headers))
        .send(markup)
    } catch (err) {
      console.error(err)
      res.status(500).send(err.toString())
    }
  })

  // app.get('*', createRequestHandler())

  app.listen(port, () => {
    console.log('Ready on http://localhost:3000')
  })
}
