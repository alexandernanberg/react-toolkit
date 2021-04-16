process.env.NODE_ENV = 'production'
process.env.BABEL_ENV = 'production'

const arg = require('arg')
const fs = require('fs-extra')
const webpack = require('webpack')
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const chalk = require('chalk')
const {
  measureFileSizesBeforeBuild,
  printFileSizesAfterBuild,
} = require('react-dev-utils/FileSizeReporter')
const formatWebpackMessages = require('../lib/webpack-format-messages')
const createWebpackConfig = require('../config/webpack-config')
const paths = require('../config/paths')
const { loadConfig } = require('../config/config')

const isInteractive = process.stdout.isTTY

const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024

module.exports = async function build(argv) {
  const args = arg(
    {
      // Types
      '--help': Boolean,
      '--analyze': Boolean,
      '--profile': Boolean,

      // Aliases
      '-h': '--help',
    },
    { argv }
  )

  if (args['--help']) {
    console.log(`
Description
  Creates a production optimized app bundle

Usage
  $ react-toolkit build

Options
  --help, -h      Displays this message
  --analyze       Analyzes the build
  --profile       Build app for profiling
`)
    process.exit(0)
  }

  const analyzeBundle = args['--analyze']
  const reactProductionProfiling = args['--profile']

  const config = await loadConfig()

  if (!checkRequiredFiles([paths.appServer, paths.appClient])) {
    process.exit(1)
  }

  const previousFileSizes = await measureFileSizesBeforeBuild(paths.appBuild)

  if (isInteractive) {
    // clearConsole()
  }

  console.log('Creating an optimized production build...\n')

  fs.emptyDirSync(paths.appBuild)

  // copyPublicFolder()

  const compilerConfig = [
    createWebpackConfig({
      isServer: true,
      config,
      analyzeBundle,
      reactProductionProfiling,
    }),
    createWebpackConfig({
      isServer: false,
      config,
      analyzeBundle,
      reactProductionProfiling,
    }),
  ]

  const compiler = webpack(compilerConfig)

  compiler.run((error, stats) => {
    let messages
    if (error) {
      if (!error.message) {
        console.log(error)
        return
      }

      messages = formatWebpackMessages({
        errors: [error.message],
        warnings: [],
      })
    } else {
      messages = formatWebpackMessages(
        stats.toJson({ all: false, warnings: true, errors: true })
      )
    }

    const isSuccessful = !messages.errors.length && !messages.warnings.length
    if (isSuccessful) {
      console.log(chalk.green('Compiled successfully!\n'))
    }

    if (messages.errors.length) {
      if (messages.errors.length > 1) {
        messages.errors.length = 1
      }
      console.log(chalk.red('Failed to compile.\n'))
      console.log(messages.errors.join('\n\n'))
      process.exit(1)
      return
    }

    if (messages.warnings.length) {
      console.log(chalk.yellow('Compiled with warnings.\n'))
      console.log(messages.warnings.join('\n\n'))
    }

    if (!analyzeBundle) {
      console.log('File sizes after gzip:\n')
      printFileSizesAfterBuild(
        stats,
        previousFileSizes,
        paths.appBuild,
        WARN_AFTER_BUNDLE_GZIP_SIZE,
        WARN_AFTER_CHUNK_GZIP_SIZE
      )
      console.log()
    }
  })
}
