const {
  fetch: nodeFetch,
  Headers: NodeHeaders,
  Request: NodeRequest,
  Response: NodeResponse,
} = require('./fetch')

exports.injectGlobals = function injectGlobals() {
  global.Headers = NodeHeaders
  global.Request = NodeRequest
  global.Response = NodeResponse
  global.fetch = nodeFetch
}
