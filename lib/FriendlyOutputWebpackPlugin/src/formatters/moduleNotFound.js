const chalk = require('chalk')
const { concat } = require('../utils')

function isRelative(module) {
  return module.startsWith('./') || module.startsWith('../')
}

function formatGroup(group) {
  return `* ${group.module}`
}

function forgetToInstall(missingDependencies) {
  const moduleNames = missingDependencies.map(
    missingDependency => missingDependency.module
  )

  if (missingDependencies.length === 1) {
    return `To install it, you can run: npm install --save ${moduleNames.join(
      ' '
    )}`
  }

  return `To install them, you can run: npm install --save ${moduleNames.join(
    ' '
  )}`
}

function dependenciesNotFound(dependencies) {
  if (dependencies.length === 0) return undefined

  return [
    dependencies.length === 1
      ? 'This dependency was not found:'
      : 'These dependencies were not found:',
    '',
    ...dependencies.map(formatGroup),
    '',
    forgetToInstall(dependencies),
  ]
}

function relativeModulesNotFound(modules) {
  if (modules.length === 0) return undefined

  return [
    modules.length === 1
      ? 'This relative module was not found:'
      : 'These relative modules were not found:',
    '',
    ...modules.map(formatGroup),
  ]
}

function groupByFile(errors) {
  const missingModule = new Map()

  errors.forEach(error => {
    if (!missingModule.has(error.file)) {
      missingModule.set(error.file, [])
    }
    missingModule.get(error.file).push(error)
  })

  return Array.from(missingModule.keys()).map(file => ({
    file,
    errors: missingModule.get(file),
  }))
}

function formatErrors(errors) {
  if (errors.length === 0) {
    return []
  }

  const groups = groupByFile(errors)

  return concat(
    groups.map(group => [
      chalk.inverse(group.file),
      '',
      relativeModulesNotFound(
        group.errors.filter(error => isRelative(error.module))
      ),
      '',
      dependenciesNotFound(
        group.errors.filter(error => !isRelative(error.module))
      ),
    ])
  )
}

function format(errors) {
  return formatErrors(errors.filter(e => e.type === 'module-not-found'))
}

module.exports = format
