const webpack = require('webpack')

module.exports = async function compile(config) {
  const compiler = webpack(config)

  compiler.run((err, statsOrMultiStats) => {})
}
