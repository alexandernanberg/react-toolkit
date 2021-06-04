const path = require('path')
const { Headers } = require('./server/fetch')
const { loadConfig } = require('./server/config')
const { createServerHandoffString } = require('./server/server-handoff')

function expressReqToRequest(req) {
  const headers = new Headers(Object.entries(req.headers))
  return new Request(req.url, { headers, method: req.method })
}

async function createRequestHandler() {
  const config = await loadConfig()
  // eslint-disable-next-line import/no-dynamic-require
  const serverEntryModule = require(path.join(
    config.serverBuildDirectory,
    'entry.server.js'
  ))
  // eslint-disable-next-line import/no-dynamic-require
  const buildManifest = require(path.join(
    config.assetsBuildDirectory,
    'build-manifest.json'
  ))

  return async (req, res) => {
    try {
      const request = expressReqToRequest(req)

      const serverHandoff = {
        buildManifest,
      }
      const entryContext = {
        ...serverHandoff,
        serverHandoffString: createServerHandoffString(serverHandoff),
      }
      const response = await serverEntryModule.default(
        request,
        200,
        new Headers(),
        entryContext
      )

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
