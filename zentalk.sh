#!/usr/bin/env node

/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var program = require('commander')
  , readline = require('readline')
  , read = require('read')
  , events = require('events')
  , WebSocket = require('ws')
  , util = require('util')
  , fs = require('fs')
  , tty = require('tty')

/**
 * InputReader - processes console input.
 */
function Console() {
  if (!(this instanceof Console)) return new Console()

  this.stdin = process.stdin
  this.stdout = process.stdout

  this.readlineInterface = readline.createInterface(this.stdin, this.stdout)

  var self = this

  this.readlineInterface.on('line', function line(data) {
    self.emit('line', data)
  }).on('close', function close() {
    self.emit('close')
  })

  this._resetInput = function() {
    self.clear()
  }
}

util.inherits(Console, events.EventEmitter)

Console.Colors = {
  Red: '\033[31m',
  Green: '\033[32m',
  Yellow: '\033[33m',
  Blue: '\033[34m',
  Default: '\033[39m'
}

Console.Types = {
  Incoming: '',
  Control: '',
  Error: 'error: ',
}

Console.prototype.prompt = function prompt() {
  this.readlineInterface.prompt()
}

Console.prototype.print = function print(type, msg, color) {
  if (tty.isatty(1)) {
    this.clear()
    color = color || Console.Colors.Default
    this.stdout.write(color + type + msg + Console.Colors.Default + '\n')
    this.prompt()
  } else if (type === Console.Types.Incoming) {
    this.stdout.write(msg + '\n')
  } else {
    // is a control message and we're not in a tty... drop it.
  }
}

Console.prototype.clear = function clear() {
  if (tty.isatty(1)) {
    this.stdout.write('\033[2K\033[E')
  }
}

Console.prototype.pause = function pausing() {
  this.stdin.on('keypress', this._resetInput)
}

Console.prototype.resume = function resume() {
  this.stdin.removeListener('keypress', this._resetInput)
}

function appender(xs) {
  xs = xs || []

  return function (x) {
    xs.push(x)
    return xs
  }
}

function into(obj, kvals) {
  kvals.forEach(function (kv) {
    obj[kv[0]] = kv[1]
  })

  return obj
}

function splitOnce(sep, str) { // sep can be either String or RegExp
  var tokens = str.split(sep)
  return [tokens[0], str.replace(sep, '').substr(tokens[0].length)]
}

/**
 * The actual application
 */
//var version = require('./package.json').version

program
//  .version(version)
  .usage('[options] (--connect <url>)')
  .option('-c, --connect <url>', 'connect to a websocket server')
  .option('-p, --protocol <version>', 'optional protocol version')
  .option('-o, --origin <origin>', 'optional origin')
  .option('--host <host>', 'optional host')
  .option('-s, --subprotocol <protocol>', 'optional subprotocol')
  .option('-n, --no-check', 'Do not check for unauthorized certificates')
  .option('-H, --header <header:value>', 'Set an HTTP header. Repeat to set multiple.', appender(), [])
  .option('--auth <username:password>', 'Add basic HTTP authentication header.')
  .option('--ca <ca>', 'Specify a Certificate Authority.')
  .option('--cert <cert>', 'Specify a Client SSL Certificate.')
  .option('--key <key>', 'Specify a Client SSL Certificate\'s key.')
  .option('--passphrase [passphrase]', 'Specify a Client SSL Certificate Key\'s passphrase. If you don\'t provide a value, it will be prompted for.')
  .parse(process.argv)

if (program.listen && program.connect) {
  console.error('\033[33merror: use either --connect\033[39m')
  process.exit(-1)
} else if (program.connect) {
  var options = {}
  var cont = function () {
    var wsConsole = new Console()

    if (program.protocol) options.protocolVersion = +program.protocol
    if (program.origin) options.origin = program.origin
    if (program.subprotocol) options.protocol = program.subprotocol
    if (program.host) options.host = program.host
    if (!program.check) options.rejectUnauthorized = program.check
    if (program.ca) options.ca = fs.readFileSync(program.ca)
    if (program.cert) options.cert = fs.readFileSync(program.cert)
    if (program.key) options.key = fs.readFileSync(program.key)

    var headers = into({}, (program.header || []).map(function split(s) {
      return splitOnce(':', s)
    }))

    if (program.auth) {
      headers.Authorization = 'Basic '+ new Buffer(program.auth).toString('base64')
    }

    var connectUrl = program.connect
    if (!connectUrl.match(/\w+:\/\/.*$/i)) {
      connectUrl = 'ws://' + connectUrl
    }

    options.headers = headers
    var ws = new WebSocket(connectUrl, options)
    var key = ws._req._headers['sec-websocket-key']
console.log('Client ID: ', key)

    ws.on('open', function open() {
      wsConsole.print(Console.Types.Control, 'connected (press CTRL+C to quit)', Console.Colors.Green)
      wsConsole.on('line', function line(data) {
        ws.send(data)
        wsConsole.prompt()
      })
    }).on('close', function close() {
      wsConsole.print(Console.Types.Control, 'disconnected', Console.Colors.Green)
      wsConsole.clear()
      process.exit()
    }).on('error', function error(code, description) {
      wsConsole.print(Console.Types.Error, code + (description ? ' ' + description : ''), Console.Colors.Yellow)
      process.exit(-1)
    }).on('message', function message(data, flags) {
      wsConsole.print(Console.Types.Incoming, data, Console.Colors.Blue)
    })

    wsConsole.on('close', function close() {
      ws.close()
      process.exit()
    })
  }

  if (program.passphrase === true) {
    var readOptions = {
      prompt: 'Passphrase: ',
      silent: true,
      replace: '*'
    }
    read(readOptions, function(err, passphrase) {
      options.passphrase = passphrase
      cont()
    })
  } else if (typeof program.passphrase === 'string') {
    options.passphrase = program.passphrase
    cont()
  } else {
    cont()
  }
} else {
  program.help()
}
