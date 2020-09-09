var Moment = require('moment')

module.exports = (trade_id, data) => { 
  if (data !== undefined && typeof process.stdout.clearLine == 'function') {
    process.stdout.clearLine()
    process.stdout.write(data.pingCount + ' trades processed so far. The most recently processed trade happened ' + Moment(data.time).fromNow() + '.' )
    process.stdout.cursorTo(0)
  }
}

