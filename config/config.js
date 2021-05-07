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

  const buildDirectory = path.resolve(
    rootDirectory,
    appConfig.buildDirectory || 'build'
  )
  const publicDirectory = path.resolve(
    rootDirectory,
    appConfig.publicDirectory || 'public'
  )
  const appDirectory = path.resolve(
    rootDirectory,
    appConfig.appDirectory || 'app'
  )
  const publicPath = appConfig.publicPath || '/'
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
    buildDirectory,
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
