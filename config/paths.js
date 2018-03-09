const path = require('path')
const fs = require('fs')

const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = relativePath => path.resolve(appDirectory, relativePath)

module.exports = {
  appBuild: resolveApp('dist'),
  appPublic: resolveApp('public'),
  appHtml: resolveApp('public/index.html'),
  appIndexJs: resolveApp('src/index.js'),
  appServiceWorker: resolveApp('src/service-worker.js'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  publicPath: '/',
  appNodeModules: resolveApp('node_modules'),
}
