const chalk = require('chalk')
const { concat } = require('../utils')

function removeLoaders(file) {
  if (!file) {
    return ''
  }
  const split = file.split('!')
  const filePath = split[split.length - 1]
  return `${filePath}`
}

function isDefaultError(error) {
  return !error.type
}

function displayError(severity, error) {
  return concat(
    `${chalk.inverse(removeLoaders(error.file))}`,
    '',
    error.message
  )
}

/**
 * Format errors without a type
 */
function format(errors, type) {
  return errors
    .filter(isDefaultError)
    .reduce((accum, error) => accum.concat(displayError(type, error)), [])
}

module.exports = format
