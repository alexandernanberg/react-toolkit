const webpack = require('webpack')
const createStore = require('unistore')
const createWebpackConfig = require('./compiler/webpack-config')
const formatWebpackMessages = require('./compiler/webpack-format-messages')

const Starting = 0
const Compiling = 1
const CompiledWithErrors = 2
const CompiledWithWarnings = 3
const Compiled = 4

exports.watch = async function watch(
  config,
  { onBuildStart, onBuildFinish, onWarning, onError }
) {
  const store = createStore()

  let prevState
  store.subscribe((state) => {
    if (state.status === prevState?.status) {
      return
    }

    switch (state.status) {
      case Compiling:
        onBuildStart()
        break
      case CompiledWithErrors:
        onError(state.errors.join('\n\n'))
        break
      case CompiledWithWarnings:
        onWarning(state.warnings.join('\n\n'))
        break
      case Compiled:
        onBuildFinish()
        break
      default:
        break
    }

    prevState = state
  })

  const compilerConfig = [
    createWebpackConfig({
      isServer: true,
      config,
    }),
    createWebpackConfig({
      isServer: false,
      config,
    }),
  ]

  store.setState({ status: Starting })

  let compiler
  try {
    compiler = webpack(compilerConfig)
  } catch (err) {
    onError(err.message || err)
    process.exit(1)
  }

  compiler.hooks.invalid.tap('invalid', () => {
    store.setState({ status: Compiling })
  })

  compiler.hooks.done.tap('done', (stats) => {
    const statsData = stats.toJson('errors-warnings')
    const messages = formatWebpackMessages(statsData)

    const isSuccessful = !messages.errors.length && !messages.warnings.length

    if (isSuccessful) {
      store.setState({
        status: Compiled,
        errors: null,
        warnings: null,
      })
    }

    if (messages.errors.length) {
      if (messages.errors.length > 1) {
        messages.errors.length = 1
      }
      store.setState({
        status: CompiledWithErrors,
        errors: messages.errors,
      })
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

exports.run = async function run(
  config,
  { analyzeBundleSizes, profileReact, onError, onBuildFinish, onWarning }
) {
  const compilerConfig = [
    createWebpackConfig({
      isServer: true,
      config,
      analyzeBundleSizes,
      profileReact,
    }),
    createWebpackConfig({
      isServer: false,
      config,
      profileReact,
    }),
  ]

  const compiler = webpack(compilerConfig)

  compiler.run((error, stats) => {
    compiler.close(() => {
      if (error) {
        const reason = error?.toString()
        if (!reason) {
          onError(error)
          return
        }

        onError(
          formatWebpackMessages({
            errors: [reason],
            warnings: [],
          }).errors.join('\n\n')
        )
        return
      }

      const statsData = stats.toJson('errors-warnings')
      const messages = formatWebpackMessages(statsData)

      if (messages.errors.length) {
        if (messages.errors.length > 1) {
          messages.errors.length = 1
        }
        onError(messages.errors.join('\n\n'))
        process.exit(1)
      }

      if (messages.warnings.length) {
        onWarning(messages.warnings.join('\n\n'))
        process.exit(1)
      }

      onBuildFinish(stats)
    })
  })
}
