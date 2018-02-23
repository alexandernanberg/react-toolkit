const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware')
const noopServiceWorkerMiddleware = require('react-dev-utils/noopServiceWorkerMiddleware')
const paths = require('./paths')

module.exports = ({ host, protocol }) => ({
  disableHostCheck: true,
  compress: true,
  hot: true,
  clientLogLevel: 'none',
  quiet: true,
  contentBase: paths.appPublic,
  publicPath: paths.publicPath,
  https: protocol === 'https',
  host,
  overlay: false,
  historyApiFallback: {
    disableDotRule: true,
  },
  before: (app) => {
    app.use(errorOverlayMiddleware())
    app.use(noopServiceWorkerMiddleware())
  },
})
