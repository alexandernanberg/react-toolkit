const { cosmiconfig } = require('cosmiconfig')
const path = require('path')
const fs = require('fs')
const { name } = require('../package.json')

const currentDirectory = fs.realpathSync(process.cwd())
function resolveApp(relativePath) {
  return path.resolve(currentDirectory, relativePath)
}

const explorer = cosmiconfig(name, {
  searchPlaces: [`${name}.config.js`],
})

const defaultConfig = {
  appBuild: resolveApp('build'),
  appPublic: resolveApp('public'),
  appDirectory: resolveApp('app'),
  publicPath: '/',
}

exports.loadConfig = async function loadConfig() {
  const result = await explorer.search()

  let config = { ...defaultConfig }
  if (result) {
    const userConfig =
      typeof result.config === 'function'
        ? result.config({ config: defaultConfig })
        : result.config

    config = { ...defaultConfig, ...userConfig }
  }

  config.appPath = resolveApp('.')
  config.entryServer = resolveApp(`${config.appDirectory}/entry.server.js`)
  config.entryClient = resolveApp(`${config.appDirectory}/entry.client.js`)
  config.appNodeModules = resolveApp('node_modules')
  config.appPackageJson = resolveApp('package.json')

  return config
}
