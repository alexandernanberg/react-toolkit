/* eslint-disable no-console */
const chalk = require('chalk')
const stringWidth = require('string-width')

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function textColor(severity) {
  switch (severity.toLowerCase()) {
    case 'success':
      return 'green'
    case 'info':
      return 'blue'
    case 'note':
      return 'white'
    case 'warning':
      return 'yellow'
    case 'error':
    default:
      return 'red'
  }
}

function bgColor(severity) {
  const color = textColor(severity)
  return `bg${capitalizeFirstLetter(color)}`
}

function formatText(severity, message) {
  return chalk[textColor(severity)](message)
}

function formatTitle(severity, message) {
  return chalk[bgColor(severity)].black('', message, '')
}

exports.info = function info(message) {
  const titleFormatted = formatTitle('info', 'I')
  console.log(titleFormatted, `${message}\n`)
}

exports.note = function note(message) {
  const titleFormatted = formatTitle('note', 'N')
  console.log(titleFormatted, `${message}\n`)
}

exports.title = function title(severity, rawTitle, rawSubtitle) {
  const date = new Date()
  const dateString = chalk.grey(date.toLocaleTimeString())
  const titleFormatted = formatTitle(severity, rawTitle.toUpperCase())
  const subTitleFormatted = formatText(severity, rawSubtitle)
  const message = `${titleFormatted} ${subTitleFormatted}`

  const logSpace =
    process.stdout.columns - stringWidth(message) - stringWidth(dateString) ||
    10

  console.log(`${message}${' '.repeat(logSpace)}${dateString}\n`)
}

exports.log = console.log

exports.clear = function clear() {
  process.stdout.write(
    process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H'
  )
}
