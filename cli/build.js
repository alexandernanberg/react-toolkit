const arg = require('arg')
const compile = require('../lib/build')

module.exports = async function build(argv) {
  const args = arg(
    {
      // Types
      '--help': Boolean,

      // Aliases
      '-h': '--help',
    },
    { argv }
  )

  if (args['--help']) {
    console.log(`
Description
  Creates a production optimized app bundle

Usage
  $ react-toolkit build

Options
  --help, -h      Displays this message
`)
    process.exit(0)
  }

  compile()
}
