const path = require('path')
const fs = require('fs/promises')

exports.loadConfig = async function loadConfig() {
  const rootDirectory = await fs.realpath(process.cwd())
  const configFile = path.resolve(rootDirectory, 'react-toolkit.config.js')

  let appConfig = {}
  if (await fileExists(configFile)) {
    try {
      appConfig = require(configFile)
    } catch (error) {
      console.error(`Error loading config in ${configFile}`)
      console.error(error)
      process.exit()
    }
  }

  const publicDirectory = path.resolve(
    rootDirectory,
    appConfig.publicDirectory || 'public'
  )
  const assetsBuildDirectory = path.resolve(
    rootDirectory,
    appConfig.assetsBuildDirectory || 'public/build'
  )
  const serverBuildDirectory = path.resolve(
    rootDirectory,
    appConfig.serverBuildDirectory || 'build'
  )
  const appDirectory = path.resolve(
    rootDirectory,
    appConfig.appDirectory || 'app'
  )
  const publicPath = appConfig.publicPath || '/build/'
  const entryServer = path.resolve(
    rootDirectory,
    appDirectory,
    'entry.server.js'
  )
  const entryClient = path.resolve(
    rootDirectory,
    appDirectory,
    'entry.client.js'
  )
  const nodeModulesDirectory = path.resolve(rootDirectory, 'node_modules')

  return {
    rootDirectory,
    serverBuildDirectory,
    assetsBuildDirectory,
    publicDirectory,
    appDirectory,
    publicPath,
    entryServer,
    entryClient,
    nodeModulesDirectory,
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}
