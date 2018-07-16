const moment = require('moment')
const stackTrace = require('stack-trace')
const winston = require('winston')
const fs = require('fs')
const path = require('path')
const config = require('./config')

let infoLogger
let logLevel = config.logLevel || 'debug' // levels are 'debug', 'info'

const timeFormatFn = function () {
  if (config.logTime) return '[' + moment().toISOString() + ']'
}

let transports = []
transports.push(new winston.transports.Console({
  colorize: true,
  timestamp: timeFormatFn,
  level: logLevel
}))

var errorLogger = new winston.Logger({
  exitOnError: false,
  transports: transports
})

module.exports.createInfoLogger = function () {
  infoLogger = new winston.Logger({
    exitOnError: false,
    transports: transports
  })
}

module.exports.info = function (msg) {
  var out = buildOutput(msg)
  infoLogger.info(out)
}

module.exports.error = function (msg) {
  var out = buildOutput(msg)
  errorLogger.error(out)
}

module.exports.debug = function (msg) {
  var out = buildOutput(msg)
  infoLogger.debug(out)
}

var onceMsgs = {}
module.exports.once = function (msg) {
  if (onceMsgs[msg]) return
  onceMsgs[msg] = true
  var out = buildOutput(msg)
  infoLogger.debug(out)
}

function buildOutput (msg) {
  var trace = stackTrace.get()
  var caller = trace[2]
  var file, line
  if (caller) {
    var path = caller.getFileName()
    var pieces = path.split('/')
    file = pieces[pieces.length - 1]
    line = caller.getLineNumber()
  }
  var out = ''
  if (file && line) {
    out += '[' + file + ':' + line + '] '
  }
  out += msg
  return out
}

exports.createInfoLogger()
