'use strict'

process.env.NODE_ENV = 'production'

const chalk = require('chalk')
const fs = require('fs-extra')
const webpack = require('webpack')
const config = require('../config/webpack.config.prod')
const paths = require('../config/paths')
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')

if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1)
}

function copyPublicFolder() {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: file => file !== paths.appHtml,
  })
}

function build() {
  console.log(chalk.blue('Creating a optimized production bundle...'))

  fs.emptyDirSync(paths.appBuild)
  copyPublicFolder()

  const compiler = webpack(config)

  compiler.run((err, stats) => {
    // console.log(stats)
  })
}

build()
