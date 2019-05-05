#!/usr/bin/env node

const arg = require('arg')
const fs = require('fs-extra')

;(async () => {
  const commands = {
    dev: async () => require('../cli/dev'),
    build: async () => require('../cli/build'),
  }
  const defaultCommand = 'dev'

  const args = arg(
    {
      // Types
      '--version': Boolean,
      '--help': Boolean,

      // Aliases
      '-v': '--version',
      '-h': '--help',
    },
    {
      permissive: true,
    }
  )

  const foundCommand = Boolean(commands[args._[0]])

  if (args['--version']) {
    const { version } = await fs.readJson('package.json')
    console.log(`react-toolkit v${version}`)
    process.exit(0)
  }

  if (!foundCommand && args['--help']) {
    console.log(`
Usage
  $ react-toolkit <command>

Available commands
  ${Object.keys(commands).join(', ')}

Options
  --version, -v   Version number
  --help, -h      Displays this message

For more information run a command with the --help flag
  $ react-toolkit dev --help
`)
    process.exit(0)
  }

  const command = foundCommand ? args._[0] : defaultCommand
  const forwardedArgs = foundCommand ? args._.slice(1) : args._

  if (args['--help']) {
    forwardedArgs.push('--help')
  }

  const defaultEnv = command === 'dev' ? 'development' : 'production'
  process.env.NODE_ENV = process.env.NODE_ENV || defaultEnv

  const exec = await commands[command]()
  exec(forwardedArgs)
})()
