// Temporary solution until react-scripts gets Webpack 4 support

const escapeStringRegexp = require('escape-string-regexp')

class InterpolateHtmlPlugin {
  constructor(replacements) {
    this.replacements = replacements
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('InterpolateHtmlPlugin', (compilation) => {
      compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing.tap(
        'InterpolateHtmlPlugin',
        (data) => {
          Object.keys(this.replacements).forEach((key) => {
            const value = this.replacements[key]
            // eslint-disable-next-line no-param-reassign
            data.html = data.html.replace(
              new RegExp(`%${escapeStringRegexp(key)}%`, 'g'),
              value
            )
          })
        }
      )
    })
  }
}

module.exports = InterpolateHtmlPlugin
