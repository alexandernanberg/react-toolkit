const nodeFetch = require('node-fetch')

const { Headers, Request, Response } = nodeFetch

/**
 * A `fetch` function for node that matches the web Fetch API.
 *
 * @see https://github.com/node-fetch/node-fetch
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
 */
exports.fetch = function fetch(input, init) {
  return nodeFetch(input, { compress: false, ...init })
}

exports.Headers = Headers
exports.Request = Request
exports.Response = Response
