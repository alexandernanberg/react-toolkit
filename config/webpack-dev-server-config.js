const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware')
const evalSourceMapMiddleware = require('react-dev-utils/evalSourceMapMiddleware')
const paths = require('./paths')

module.exports = (host) => ({
  disableHostCheck: true,
  compress: true,
  clientLogLevel: 'silent',
  quiet: true,
  hot: true,
  transportMode: 'ws',
  injectClient: false,
  contentBase: paths.appPublic,
  publicPath: paths.publicPath,
  host,
  overlay: false,
  historyApiFallback: {
    disableDotRule: true,
  },
  before: (app, server) => {
    app.use(evalSourceMapMiddleware(server))
    app.use(errorOverlayMiddleware())
  },
})
