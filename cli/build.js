process.env.NODE_ENV = 'production'
process.env.BABEL_ENV = 'production'

const arg = require('arg')
const fs = require('fs-extra')
const chalk = require('chalk')
const {
  measureFileSizesBeforeBuild,
  printFileSizesAfterBuild,
} = require('react-dev-utils/FileSizeReporter')
const prettyMs = require('pretty-ms')
const checkRequiredFiles = require('../server/verify-required-files')
const { loadConfig } = require('../server/config')
const compiler = require('../server/compiler')

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

  console.log('Creating an optimized production build...')

  const config = await loadConfig()

  if (!(await checkRequiredFiles([config.entryServer, config.entryClient]))) {
    process.exit(1)
  }

  const previousFileSizes = await measureFileSizesBeforeBuild(
    config.assetsBuildDirectory
  )

  await Promise.all([
    fs.emptyDir(config.serverBuildDirectory),
    fs.emptyDir(config.assetsBuildDirectory),
  ])

  const start = Date.now()

  await compiler.run(config, {
    onBuildFinish(stats) {
      console.log(
        `${chalk.green('Compiled successfully')} ${chalk.dim(
          `in ${prettyMs(Date.now() - start)}`
        )}\n`
      )

      if (!analyzeBundle) {
        console.log('File sizes after gzip:\n')
        printFileSizesAfterBuild(
          stats.stats[1],
          previousFileSizes,
          config.assetsBuildDirectory,
          WARN_AFTER_BUNDLE_GZIP_SIZE,
          WARN_AFTER_CHUNK_GZIP_SIZE
        )
        console.log()
      }
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
}
