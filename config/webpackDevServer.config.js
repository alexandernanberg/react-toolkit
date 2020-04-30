const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware')
const evalSourceMapMiddleware = require('react-dev-utils/evalSourceMapMiddleware')
const paths = require('./paths')

module.exports = ({ host, protocol }) => ({
  disableHostCheck: true,
  compress: true,
  hot: true,
  clientLogLevel: 'silent',
  quiet: true,
  contentBase: paths.appPublic,
  publicPath: paths.publicPath,
  https: protocol === 'https',
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
