const jsesc = require('jsesc')

exports.createServerHandoffString = function createServerHandoffString(
  serverHandoff
) {
  return jsesc(serverHandoff, { isScriptContext: true, quotes: 'double' })
}
