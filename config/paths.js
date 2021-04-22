const path = require('path')
const fs = require('fs')

const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath)

module.exports = {
  appBuild: resolveApp('build'),
  appServer: resolveApp('app/entry.server.js'),
  appClient: resolveApp('app/entry.client.js'),
  appNodeModules: resolveApp('node_modules'),
  appPackageJson: resolveApp('package.json'),
  appPath: resolveApp('.'),
  appPublic: resolveApp('public'),
  appSrc: resolveApp('app'),
  publicPath: '/',
}
