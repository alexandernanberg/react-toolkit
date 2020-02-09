/* eslint-disable no-console */
const fs = require('fs-extra')
const webpack = require('webpack')
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const clearConsole = require('react-dev-utils/clearConsole')
const FileSizeReporter = require('react-dev-utils/FileSizeReporter')
const createWebpackConfig = require('../config/webpack.config')
const paths = require('../config/paths')
const { loadConfig } = require('../config/config')
const output = require('../lib/FriendlyOutputWebpackPlugin/src/output')

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
    filter: file => file !== paths.appHtml,
  })
}

module.exports = async function build({ runAnalyzer }) {
  const config = await loadConfig()

  if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
    process.exit(1)
  }

  const previousFileSizes = await measureFileSizesBeforeBuild(paths.appBuild)

  if (isInteractive) {
    clearConsole()
  }

  output.title('info', 'wait', 'Creating an optimized production build...')

  fs.emptyDirSync(paths.appBuild)

  copyPublicFolder()

  const compilerConfig = createWebpackConfig({ runAnalyzer, config })
  const compiler = webpack(compilerConfig)

  compiler.run((err, stats) => {
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
