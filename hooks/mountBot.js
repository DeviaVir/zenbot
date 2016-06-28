var numeral = require('numeral')
  , colors = require('colors')
  , tb = require('timebucket')
  , through = require('through')

module.exports = function container (get, set, clear) {
  return function mountBot (cb) {
    var minTime = new Date().getTime() - (86400000 * 90) // 90 days ago
    var bot = get('conf.bot')
    var initBalance = JSON.parse(JSON.stringify(bot.balance))
    var side = null
    var periodVol = 0
    var counter = 0
    var runningVol = 0, runningTotal = 0
    var high = 0, low = 10000, close = 0, vol = 0
    var maxDiff = 0

    function printReport () {
      var newBalance = JSON.parse(JSON.stringify(bot.balance))
      newBalance.currency += newBalance.asset * close
      newBalance.asset = 0
      var diff = newBalance.currency - initBalance.currency
      if (diff > 0) diff = ('+' + numeral(diff).format('$0,0.00')).green
      if (diff === 0) diff = ('+' + numeral(diff).format('$0,0.00')).white
      if (diff < 0) diff = (numeral(diff).format('$0,0.00')).red
      get('console').log('[bot]', diff)
    }

    function getGraph () {
      runningTotal += ((high + low + close) / 3) * periodVol
      //console.log('runningTotal', runningTotal)
      runningVol += periodVol
      //console.log('runningVol', runningVol)
      var vwap = runningTotal / runningVol
      //console.log('vwap', vwap)
      var vwapDiff = close - vwap
      //console.log('vwapDiff', vwapDiff)
      maxDiff = Math.max(maxDiff, Math.abs(vwapDiff))
      //console.log('maxDiff', maxDiff)
      var barWidth = 20
      var half = barWidth / 2
      var bar = ''
      if (vwapDiff > 0) {
        bar += ' '.repeat(half)
        var stars = Math.min(Math.round((vwapDiff / maxDiff) * half), half)
        bar += '+'.green.repeat(stars)
        bar += ' '.repeat(half - stars)
      }
      else if (vwapDiff < 0) {
        var stars = Math.min(Math.round((Math.abs(vwapDiff) / maxDiff) * half), half)
        bar += ' '.repeat(half - stars)
        bar += '-'.red.repeat(stars)
        bar += ' '.repeat(half)
      }
      else {
        bar += ' '.repeat(half * 2)
      }
      vol = 0
      high = 0
      low = 10000
      return bar
    }

    var tickStream = through(function write (tick) {
      periodVol += tick.vol
      close = tick.close
      high = Math.max(high, tick.high)
      low = Math.min(low, tick.low)

      if (side && tick.side !== side) {
        vol -= tick.vol
        if (vol < 0) side = tick.side
        vol = Math.abs(vol)
      }
      else {
        side = tick.side
        vol += tick.vol
      }
      if (vol >= bot.min_vol) {
        vol = 0
        // trigger
        if (side === 'BUY' && !bot.balance.currency) {
          get('console').log('got BUY signal but i\'m broke.')
        }
        else if (side === 'SELL' && !bot.balance.asset) {
          get('console').log('got SELL signal but i got no BTC')
        }
        else if (side === 'BUY') {
          var spend = bot.balance.currency / 2
          if (spend / close < bot.min_trade) {
            get('console').log('[bot] HOLD')
            return
          }
          bot.balance.currency -= spend
          bot.balance.asset += spend / close
          get('console').log('[bot] BUY ' + numeral(spend / close).format('00.000') + ' BTC at ' + numeral(close).format('$0,0.00'))
        }
        else if (side === 'SELL') {
          var sell = bot.balance.asset / 2
          if (sell < bot.min_trade) {
            get('console').log('[bot] HOLD')
            return
          }
          bot.balance.asset -= sell
          bot.balance.currency += sell * close
          get('console').log('[bot] SELL ' + numeral(sell).format('00.000') + ' BTC at ' + numeral(close).format('$0,0.00'))
        }
        printReport()
      }
    })
    function getNext () {
      var params = {
        query: {
          time: {
            $gt: minTime
          }
        },
        sort: {
          time: 1
        },
        limit: 100
      }
      get('db.ticks').select(params, function (err, ticks) {
        if (err) {
          get('console').error('tick select err', err)
          return setTimeout(getNext, 1000)
        }
        if (!ticks.length) {
          return setTimeout(getNext, get('conf.tick_interval'))
        }
        ticks.forEach(function (tick) {
          if (!close) {
            initBalance.currency += initBalance.asset * tick.close
            initBalance.asset = 0
          }
          close = tick.close
          tickStream.write(tick)
          minTime = tick.time
          counter++
        })
        var date = new Date(minTime)
        var tzMatch = date.toString().match(/\((.*)\)/)
        var time = date.toLocaleString() + ' ' + tzMatch[1]
        if (time.length === 24) {
          time = time.replace(', ', ', 0')
        }
        var bar = getGraph()
        get('console').log(bar + ' ' + numeral(close).format('$0,0.00'), time.grey, numeral(bot.balance.asset).format('00.000') + ' BTC/USD ' + numeral(bot.balance.currency).format('$,0.00'))
        getNext()
      })
    }
    setTimeout(getNext, 1000)
    get('console').log('mounted bot.')
    cb && cb()
  }
}