/* eslint-disable no-console */
const chalk = require('chalk')

module.exports = require('babel-loader').custom(babel => {
  const presetItem = babel.createConfigItem(require('./babel-preset'), {
    type: 'preset',
  })

  const configs = new Set()

  return {
    customOptions(options) {
      const custom = {
        isDev: options.isDev,
      }

      const loader = { ...options }
      delete loader.isDev

      return { custom, loader }
    },
    config(cfg) {
      const options = { ...cfg.options }

      if (cfg.hasFilesystemConfig()) {
        // eslint-disable-next-line no-restricted-syntax
        for (const file of [cfg.babelrc, cfg.config]) {
          if (file && !configs.has(file)) {
            configs.add(file)
            console.log(
              `${chalk.bgBlue.black(
                ' I '
              )} Using external babel configuration: "${file}"\n`
            )
          }
        }
      } else {
        options.presets = [...options.presets, presetItem]
      }

      return options
    },
  }
})
