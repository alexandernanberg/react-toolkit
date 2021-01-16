/* eslint-disable no-console */
const fs = require('fs-extra')
const webpack = require('webpack')
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const clearConsole = require('react-dev-utils/clearConsole')
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages')
const FileSizeReporter = require('react-dev-utils/FileSizeReporter')
const chalk = require('react-dev-utils/chalk')
const createWebpackConfig = require('../config/webpack.config')
const paths = require('../config/paths')
const { loadConfig } = require('../config/config')

const {
  measureFileSizesBeforeBuild,
  printFileSizesAfterBuild,
} = FileSizeReporter

const isInteractive = process.stdout.isTTY

const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024

function copyPublicFolder() {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: (file) => file !== paths.appHtml,
  })
}

module.exports = async function build({ runAnalyzer, profile }) {
  const config = await loadConfig()

  if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
    process.exit(1)
  }

  const previousFileSizes = await measureFileSizesBeforeBuild(paths.appBuild)

  if (isInteractive) {
    clearConsole()
  }

  console.log('Creating an optimized production build...\n')

  fs.emptyDirSync(paths.appBuild)

  copyPublicFolder()

  const compilerConfig = createWebpackConfig({ runAnalyzer, profile }, config)
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

    if (!runAnalyzer) {
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
