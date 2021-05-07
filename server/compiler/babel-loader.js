const path = require('path')

module.exports = require('babel-loader').custom((babel) => {
  const presetItem = babel.createConfigItem(require('./babel-preset'), {
    type: 'preset',
  })

  const configs = new Set()

  return {
    customOptions(options) {
      const custom = {
        isDev: options.isDev,
        isServer: options.isServer,
      }

      const loader = { ...options }
      delete loader.isDev
      delete loader.isServer

      return { custom, loader }
    },
    config(cfg, { customOptions: { isDev, isServer } }) {
      const options = { ...cfg.options }

      if (cfg.hasFilesystemConfig()) {
        for (const file of [cfg.babelrc, cfg.config]) {
          if (file && !configs.has(file)) {
            configs.add(file)
            console.log(
              `Using external babel configuration: "${path.relative(
                path.resolve(process.cwd(), '../'),
                file
              )}"`
            )
          }
        }
      } else {
        options.presets = [...options.presets, presetItem]
      }

      options.caller.isServer = isServer
      options.caller.isDev = isDev

      return options
    },
  }
})
