const { cosmiconfig } = require('cosmiconfig')
const { name } = require('../package.json')

const explorer = cosmiconfig(name, {
  searchPlaces: [`${name}.config.js`],
})

const defaultConfig = {
  webpack: null,
  webpackDevMiddleware: null,
}

exports.loadConfig = async function getOptions() {
  const result = await explorer.search()

  // User has provided a custom config.
  if (result) {
    const userConfig =
      typeof result.config === 'function'
        ? result.config({ config: defaultConfig })
        : result.config

    return {
      ...defaultConfig,
      ...userConfig,
    }
  }

  return defaultConfig
}
