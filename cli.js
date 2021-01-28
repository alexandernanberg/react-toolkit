#!/usr/bin/env node
/* eslint-disable no-console */

const arg = require('arg')
const fs = require('fs-extra')
const { resolve } = require('path')

const defaultCommand = 'dev'
const commands = {
  dev: async () => require('./cli/dev'),
  build: async () => require('./cli/build'),
  start: async () => require('./cli/start'),
}

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
  const { version } = fs.readJsonSync(resolve(__dirname, 'package.json'))
  console.log(`react-toolkit v${version}`)
  process.exit(0)
}

if (!foundCommand && !!args._[0]) {
  console.log(`
Unknown command "${args._[0]}"

For more information on available commands use the --help flag
  $ react-toolkit --help
`)
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

commands[command]().then((exec) => exec(forwardedArgs))
