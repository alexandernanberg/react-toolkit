const path = require('path')
const { Headers } = require('whatwg-fetch')
const paths = require('./config/paths')

function expressReqToRequest(req) {
  const headers = new Headers(Object.entries(req.headers))
  return new Request(req.url, { headers, method: req.method })
}

function createRequestHandler() {
  // eslint-disable-next-line import/no-dynamic-require
  const requestHandler = require(path.join(paths.appBuild, 'entry-server.js'))
    .default
  // eslint-disable-next-line import/no-dynamic-require
  const buildManifest = require(path.join(
    paths.appBuild,
    'build-manifest.json'
  ))

  return async (req, res) => {
    try {
      const request = expressReqToRequest(req)

      // TODO: Clean this up
      if (request.url.startsWith('/_build/')) {
        res
          .status(200)
          .type('js')
          .sendFile(path.join(paths.appBuild, req.url.replace('/_build', '')))
        return
      }

      const response = requestHandler(request, 200, new Headers(), {
        buildManifest,
      })

      const markup = await response.text()
      res
        .status(response.status)
        .set(Object.fromEntries(response.headers))
        .send(markup)
    } catch (err) {
      console.error(err)
      res.status(500).send(err.toString())
    }
  }
}

module.exports = {
  createRequestHandler,
}
