const { join } = require('path')
const { loadPartialConfig, createConfigItem } = require('@babel/core')

const babelPreset = createConfigItem(require('./babel-preset'), {
  type: 'preset',
})

module.exports = function getBabelConfig(dir) {
  const babelConfig = {
    cacheDirectory: true,
    presets: [],
    babelrc: false,
  }

  const filename = join(dir, 'filename.js')
  const externalBabelConfig = loadPartialConfig({
    babelrc: true,
    filename,
  })

  if (externalBabelConfig && externalBabelConfig.babelrc) {
    babelConfig.babelrc = true
  }

  if (!babelConfig.babelrc) {
    babelConfig.presets.push(babelPreset)
  }

  return babelConfig
}
