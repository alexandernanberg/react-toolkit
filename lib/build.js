const chalk = require('chalk')
const fs = require('fs-extra')
const webpack = require('webpack')
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const createWebpackConfig = require('../config/webpack.config')
const paths = require('../config/paths')

function copyPublicFolder() {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: file => file !== paths.appHtml,
  })
}

module.exports = function build() {
  if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
    process.exit(1)
  }

  console.log(chalk.blue('Creating a optimized production bundle...'))

  fs.emptyDirSync(paths.appBuild)
  copyPublicFolder()

  const config = createWebpackConfig()
  const compiler = webpack(config)

  compiler.run((err, stats) => {
    // console.log(stats)
  })
}
