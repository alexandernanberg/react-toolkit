process.env.NODE_ENV = 'production'
process.env.BABEL_ENV = 'production'

const arg = require('arg')
const fs = require('fs-extra')
const webpack = require('webpack')
const chalk = require('chalk')
const {
  measureFileSizesBeforeBuild,
  printFileSizesAfterBuild,
} = require('react-dev-utils/FileSizeReporter')
const checkRequiredFiles = require('../server/verify-required-files')
const formatWebpackMessages = require('../server/compiler/webpack-format-messages')
const createWebpackConfig = require('../server/compiler/webpack-config')
const { loadConfig } = require('../server/config')

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

  if (!checkRequiredFiles([config.entryServer, config.entryClient])) {
    process.exit(1)
  }

  const previousFileSizes = await measureFileSizesBeforeBuild(
    config.buildDirectory
  )

  console.log('Creating an optimized production build...')

  fs.emptyDirSync(config.buildDirectory)

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
    const statsData = stats.toJson({ all: true, warnings: true, errors: true })
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
      messages = formatWebpackMessages(statsData)
    }

    const isSuccessful = !messages.errors.length && !messages.warnings.length
    if (isSuccessful) {
      const elapsedTime = Math.max(
        ...statsData.children.map((child) => child.time)
      )

      console.log(
        `${chalk.green('Compiled successfully')} ${chalk.dim(
          `in ${elapsedTime}ms`
        )}\n`
      )
    }

    if (messages.errors.length) {
      if (messages.errors.length > 1) {
        messages.errors.length = 1
      }
      console.log(chalk.red('Failed to compile\n'))
      console.log(messages.errors.join('\n\n'))
      process.exit(1)
      return
    }

    if (messages.warnings.length) {
      console.log(chalk.yellow('Compiled with warnings\n'))
      console.log(messages.warnings.join('\n\n'))
    }

    if (!analyzeBundle) {
      console.log('File sizes after gzip:\n')
      printFileSizesAfterBuild(
        stats,
        previousFileSizes,
        config.buildDirectory,
        WARN_AFTER_BUNDLE_GZIP_SIZE,
        WARN_AFTER_CHUNK_GZIP_SIZE
      )
      console.log()
    }
  })
}
