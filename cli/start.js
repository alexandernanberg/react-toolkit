process.env.NODE_ENV = 'production'
process.env.BABEL_ENV = 'production'

const arg = require('arg')
const express = require('express')
const compression = require('compression')
const { createRequestHandler } = require('../express')
const { injectGlobals } = require('../server/globals')

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
  Starts the application in production mode

Usage
  $ react-toolkit start

Options
  --port, -p      A port number on which to start the application
  --hostname, -H  Hostname on which to start the application
  --help, -h      Displays this message
`)
    process.exit(0)
  }

  const host = args['--hostname'] || HOST
  const port = args['--port'] || PORT

  const app = express()

  app.disable('x-powered-by')
  app.use(compression())

  app.use(express.static('public', { maxAge: '1h' }))
  app.use(express.static('public/build', { immutable: true, maxAge: '1y' }))

  app.all('*', await createRequestHandler())

  app.listen(port, () => {
    console.log('Ready on http://localhost:3000')
  })
}
