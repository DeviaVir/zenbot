
// Websockets additions
var   EventEmitter = require('events').EventEmitter
    , WebSocket = require('ws')
    , util = require('util')
    , port = require('portastic')
    , c = require('../conf')


function emitter() {
  EventEmitter.call(this)
}
util.inherits(emitter, EventEmitter)


var lastPeriod = ''
var subscribed =
  {
    'balance': false,
    'product': false,
    'period': false,
    'quote': false,
    'status': false,
    'strat': false,
    'trades': false,
    'lastTrade':false
  }


//========================
// WebSocket helper functions

// Show help for WS use
function showHelp(issue) {
  var wsObjects =
    "\n    Objects are:"
      + "\n\twho"
      + "\n\tbalance"
      + "\n\tproduct"
      + "\n\tperiod"
      + "\n\tstrat"
      + "\n\tquote"
      + "\n\tstatus"
      + "\n\ttrades"

  return 'Usage: get <object>' + wsObjects
}

function runStatus() {
  var stat = {
    "last_period_id": s.last_period_id,
    "acted_on_stop": s.acted_on_stop,
    "action": s.action,
    "signal": s.signal,
    "acted_on_trend": s.acted_on_trend,
    "trend": s.trend,
    "cancel_down": s.cancel_down,
    "orig_capital": s.orig_capital,
    "orig_price": s.orig_price,
    "start_capital": s.start_capital,
    "start_price": s.start_price,
    "last_signal": s.last_signal,
    "quote": s.quote
  }
    //if (so.debug) console.log(stat)
    return stat
}

function subscribe(data) {
  var s = data.split(' ')
  sub = s[1]
  if (s[0] === 'sub') {
    subscribed[sub] = true
  } else {
    subscribed[sub] = false
  }
}

// Parse command input from client
function getObject(beautify,message) {
  var stat = runStatus()
  // Global to pick up some variables
  var wsObjects =
    {
      "balance": s.balance,
      "options": s.options,
      "product": s.product,
      "period":s.period,
      "quote": s.quote,
      "strat": s.strategy,
      "trades": s.my_trades,
      "status": stat
  }

  var args = message.split(" ")
  if (args.length === 1) return "At least one argument is needed, try <help>"
  var cmd = args[0]
  var arg = args[1]
  if (beautify) {
    return JSON.stringify(wsObjects[arg],false,4)
  } else return JSON.stringify(wsObjects[arg])
}

function setVar(message) {
  var stat = runStatus()
  var args = message.split(" ",3)
  if (args.length < 3) return "Usage: set <option variable> <value>"
  var cmd = args[0]
  var arg = args[1]
  var val = args[2]
  s.options[arg] = val
  var msg = s.options[arg]
  return 'Not implemented\n'
}

var started = false
var s = false
var talker = null
//var commander = null
var countC = 0
var countT = 0
var commanderClients = {}
var talkerClients = {}
var ret = {}
var command = []

var commanderPort = 0
var talkerPort = 0

//var portRange = { min: 3010, max: 3020, retrieve:2 }

port.find( c.talker_port_range ).then(function(ports){
  talkerPort = ports[0]
  commanderPort =  ports[1]
})

exports.update = function (data) {
  s = data
  var so = s.options
  if (!started) {
    ret.wsTalker = talk(so)
    ret.wsCommand = command(so)
    started = true
  }

  ret.subscribed = subscribed
  ret.lastPeriod = lastPeriod

//console.log(s)
  //============================================================
  // The wsCommand sends whatever objects thesubscriber asks for
  //
  function  command(something) {

    commanderWS = require('ws')
    command = new commanderWS.Server({ 
      port: commanderPort,
      verifyClient: function(info) {
        // For possible future use
        //clientInfo.cli.wsKey = info.req.headers['sec-websocket-key']
        //clientInfo.cli.fd = info.req.socket._handle.fd
        //clientInfo.cli.host = info.req.headers['host']
        return true    
      }
    }, function listening() {
      console.log('Zen master is listening to you on port ', commanderPort )
    })
    
    wsCommand = new emitter()

    wsCommand.on('transmit', function transmit(data) {
      if (commander) {
        commander.send(data)
      }
    })

    wsCommand.on('close', function close(data) {
      if (commander) commander.close()
      process.exit(0)
    })

    command.on('connection', function(newClient) {
      var commander = newClient
      commander.clientId = countC++
      commanderClients[commander.clientId] = commander

      if (so.debug) console.log('\nCommander #', countC + ' is connected')
      commander.on('close', function close() {
        if (so.debug) console.log('\nCommander #', countC + ' is disconnected')
        delete commanderClients[commander.clientId]
        commander = null
        //countC--
      }).on('error', function error(code, description) {
        console.log(code + (description ? ' ' + description : ''))
      }).on('message', function message(data) {
        if (so.debug) console.log('Commander #' + countC + ' is talking ',data)
        if (data.toLowerCase().match(/get/)) {
          msg = getObject(true,data)
            commander.send(msg)
        } else if (data.toLowerCase().match(/help/)) {
          msg = showHelp()
          commander.send(msg)
        } else if (data.toLowerCase().match(/set/)) {
          commander.send(setVar(data))
        } else if (data.toLowerCase() === 'who') {
          commander.send(s.options.selector)
        } else commander.send('Unknown command: ',data)
      })
    }).on('error', function serverError(error) {
      console.log(error.message)
      process.exit(-1)
    })
    return wsCommand
  }

  //=========================================================
  // The wsTalker sends subscribed objets to *engine.js*
  //
  function talk(something) {

    talkerWS = require('ws')
    message = new talkerWS.Server({ 
      port: talkerPort,
      verifyClient: function(info) {
      // For possible future use
      //clientInfo.cli.wsKey = info.req.headers['sec-websocket-key']
      //clientInfo.cli.fd = info.req.socket._handle.fd
      //clientInfo.cli.host = info.req.headers['host']
        return true    
      }
    }, function listening() {
      console.log('Zen master is talking to you on port ' + talkerPort)
    })

    wsTalker = new emitter()
    wsTalker.on('transmit', function transmit(data) {
      if (talker) {
        talker.send(data)
      }
    })

    wsTalker.on('close', function close() {
      if (talker) talker.close()
        process.exit(0)
    })

    message.on('connection', function(newClient) {
      talker = newClient
      talker.clientId = countC++
      talkerClients[talker.clientId] = talker     
      countT++
      if (so.debug) console.log('\nTalker connected to ',countT + ' listener(s)')
      talker.on('close', function close() {
        if (so.debug) console.log('\nTalker #', countT + ' is disconnected')
        delete talkerClients[talker.clientId]
        talker = null
        //countT--
      }).on('error', function error(code, description) {
        console.log(code + (description ? ' ' + description : ''))
      }).on('message', function message(data) {
        if (so.debug) console.log('Talker #' + countT + ' is talking ',data)
        if(data.toLowerCase().match(/sub/)) {
          subscribe(data)
        }
        // Does not echo data
        talker.emit(data)
      })
    }).on('error', function serverError(error) {
      console.log(error.message)
      process.exit(-1)
    })
    return wsTalker
  }

  return ret
}

