process.env.NODE_ENV = 'development'
process.env.BABEL_ENV = 'development'

const arg = require('arg')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const express = require('express')
const compression = require('compression')
const path = require('path')
const Module = require('module')
const chalk = require('chalk')
const prettyMs = require('pretty-ms')
const { prepareUrls } = require('react-dev-utils/WebpackDevServerUtils')
const checkRequiredFiles = require('../server/verify-required-files')
const { loadConfig } = require('../server/config')
const { injectGlobals } = require('../server/globals')
const compiler = require('../server/compiler')
const { createServerHandoffString } = require('../server/server-handoff')

injectGlobals()

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

  if (!(await checkRequiredFiles([config.entryServer, config.entryClient]))) {
    process.exit(1)
  }

  console.log('Starting development server...')

  const urls = prepareUrls('http', host, port, '')

  let start = Date.now()

  const devCompiler = await compiler.watch(config, {
    onBuildStart() {
      start = Date.now()
      console.log('Compiling...')
    },
    onBuildFinish() {
      console.log(
        `${chalk.green('Compiled successfully')} ${chalk.dim(
          `in ${prettyMs(Date.now() - start)}`
        )}`
      )
      console.log(`Ready on ${urls.localUrlForTerminal}`)
    },
    onWarning(warningMessage) {
      console.log(chalk.yellow('Compiled with warnings'))
      console.log(warningMessage)
    },
    onError(errorMessage) {
      console.log(chalk.red('Failed to compile'))
      console.log(errorMessage)
    },
  })

  function expressReqToRequest(req) {
    const headers = new Headers(Object.entries(req.headers))
    return new Request(req.url, { headers, method: req.method })
  }

  const app = express()

  app.disable('x-powered-by')
  app.use(compression())

  app.use(express.static('public', { maxAge: '1h' }))
  app.use(express.static('public/build', { immutable: true, maxAge: '1y' }))

  app.use(
    webpackDevMiddleware(devCompiler, {
      serverSideRender: true,
      stats: 'none',
    })
  )

  app.use(webpackHotMiddleware(devCompiler.compilers[1], { log: false }))

  app.all('*', async (req, res) => {
    try {
      const { devMiddleware } = res.locals.webpack
      const { outputFileSystem } = devMiddleware

      const requireFromMemory = patchRequire(outputFileSystem)
      const serverEntryModule = requireFromMemory(
        path.join(config.serverBuildDirectory, 'entry.server.js')
      )

      const buildManifest = JSON.parse(
        outputFileSystem.readFileSync(
          path.join(config.assetsBuildDirectory, 'build-manifest.json'),
          'utf-8'
        )
      )

      const request = expressReqToRequest(req)
      const serverHandoff = {
        buildManifest,
      }
      const entryContext = {
        ...serverHandoff,
        serverHandoffString: createServerHandoffString(serverHandoff),
      }
      const response = await serverEntryModule.default(
        request,
        200,
        new Headers(),
        entryContext
      )

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

  app.listen(port)
}

function patchRequire(filesystem) {
  return function patchedRequire(filename) {
    const content = filesystem.readFileSync(filename, 'utf-8')

    /* eslint-disable no-underscore-dangle */
    const mod = new Module(filename, module.parent)
    mod._compile(content, filename)
    mod.paths = Module._nodeModulePaths(path.dirname(filename))
    /* eslint-enable no-underscore-dangle */

    return mod.exports
  }
}
