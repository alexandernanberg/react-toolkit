const chalk = require('react-dev-utils/chalk')
const formatWebpackMessages = require('./webpack-format-messages')

function createCompiler({ config, webpack, urls }) {
  let compiler
  try {
    compiler = webpack(config)
  } catch (err) {
    console.log(chalk.red('Failed to compile.\n'))
    console.log(err.message || err)
    process.exit(1)
  }

  compiler.hooks.invalid.tap('invalid', () => {
    console.log('Compiling...')
  })

  compiler.hooks.done.tap('done', (stats) => {
    const statsData = stats.toJson({
      all: false,
      warnings: true,
      errors: true,
    })

    const messages = formatWebpackMessages(statsData)

    const isSuccessful = !messages.errors.length && !messages.warnings.length
    if (isSuccessful) {
      console.log(chalk.green('Compiled successfully!'))
      console.log(`> Ready on ${urls.localUrlForTerminal}`)
    }

    // If errors exist, only show errors.
    if (messages.errors.length) {
      if (messages.errors.length > 1) {
        messages.errors.length = 1
      }
      console.log(chalk.red('Failed to compile.'))
      console.log(messages.errors.join('\n\n'))
      return
    }

    // Show warnings if no errors were found.
    if (messages.warnings.length) {
      console.log(chalk.yellow('Compiled with warnings.'))
      console.log(messages.warnings.join('\n\n'))
    }
  })

  return compiler
}

module.exports = { createCompiler }
