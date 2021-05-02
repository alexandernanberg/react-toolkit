const chalk = require('chalk')
const createStore = require('unistore')
const formatWebpackMessages = require('./webpack-format-messages')

const Starting = 0
const Compiling = 1
const CompiledWithErrors = 2
const CompiledWithWarnings = 3
const Compiled = 4

const store = createStore()

let prevState
store.subscribe((state) => {
  if (state.status === prevState?.status) {
    return
  }

  switch (state.status) {
    case Starting:
      console.log('Starting development server...')
      break
    case Compiling:
      console.log('Compiling...')
      break
    case CompiledWithErrors:
      console.log(chalk.red('Failed to compile'))
      console.log(state.errors.join('\n\n'))
      break
    case CompiledWithWarnings:
      console.log(chalk.yellow('Compiled with warnings'))
      console.log(state.warnings.join('\n\n'))
      break
    default:
      console.log(
        `${chalk.green('Compiled successfully')} ${chalk.dim(
          `in ${state.elapsedTime}ms`
        )}`
      )
      console.log(`Ready on ${state.urls.localUrlForTerminal}`)
      break
  }

  prevState = state
})

function createCompiler({ config, webpack, urls }) {
  let compiler
  try {
    compiler = webpack(config)
  } catch (err) {
    console.log(chalk.red('Failed to compile.\n'))
    console.log(err.message || err)
    process.exit(1)
  }

  store.setState({ status: Starting, urls })

  compiler.hooks.invalid.tap('invalid', () => {
    store.setState({ status: Compiling })
  })

  compiler.hooks.done.tap('done', (stats) => {
    const statsData = stats.toJson({ all: true, warnings: true, errors: true })
    const messages = formatWebpackMessages(statsData)

    const isSuccessful = !messages.errors.length && !messages.warnings.length

    if (isSuccessful) {
      const elapsedTime = Math.max(
        ...statsData.children.map((child) => child.time)
      )
      store.setState({
        status: Compiled,
        errors: null,
        warnings: null,
        elapsedTime,
      })
    }

    if (messages.errors.length) {
      if (messages.errors.length > 1) {
        messages.errors.length = 1
      }
      store.setState({ status: CompiledWithErrors, errors: messages.errors })
      return
    }

    if (messages.warnings.length) {
      store.setState({
        status: CompiledWithWarnings,
        warnings: messages.warnings,
      })
    }
  })

  return compiler
}

module.exports = { createCompiler }
