const { cosmiconfig } = require('cosmiconfig')
const { name } = require('../package.json')

const explorer = cosmiconfig(name, {
  searchPlaces: [`${name}.config.js`],
})

const defaultConfig = {
  webpack: null,
  webpackDevMiddleware: null,
}

function normalizeConfig(config) {
  if (typeof config === 'function') {
    return config({ defaultConfig })
  }

  return config
}

exports.loadConfig = async function getOptions() {
  const { config: userConfig } = await explorer.search()
  const config = { ...defaultConfig, ...normalizeConfig(userConfig) }

  return config
}
