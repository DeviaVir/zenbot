var numeral = require('numeral')
  , colors = require('colors')
  , tb = require('timebucket')
  , through = require('through')
  , zerofill = require('zero-fill')

module.exports = function container (get, set, clear) {
  return function (options) {
    var bot = options || {}
    var conf = get('conf.bot')
    Object.keys(conf).forEach(function (k) {
      if (typeof bot[k] === 'undefined') {
        bot[k] = JSON.parse(JSON.stringify(conf[k]))
      }
    })
    var initBalance = JSON.parse(JSON.stringify(bot.balance))
    var side = null
    var periodVol = 0
    var counter = 0
    var runningVol = 0, runningTotal = 0
    var high = 0, low = 10000, vol = 0
    var maxDiff = 0
    var buyPrice, sellPrice
    var tradeVol = 0
    var cooldown = 0
    var lastTick = {}

    function getGraph () {
      runningTotal += ((high + low + lastTick.close) / 3) * periodVol
      //console.log('runningTotal', runningTotal)
      runningVol += periodVol
      //console.log('runningVol', runningVol)
      var vwap = runningTotal / runningVol
      //console.log('vwap', vwap)
      var vwapDiff = lastTick.close - vwap
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
      high = 0
      low = 10000
      return bar
    }

    function write (tick) {
      if (!lastTick) {
        initBalance.currency += initBalance.asset * tick.close
        initBalance.asset = 0
      }
      periodVol += tick.vol
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
        get('console').log(('[bot] volume trigger ' + side + ' ' + numeral(vol).format('0.0') + ' >= ' + numeral(bot.min_vol).format('0.0')).grey)
        vol = 0
        // trigger
        if (side === 'BUY' && !bot.balance.currency) {
          get('console').log('[bot] HOLD'.grey)
          return finish()
        }
        else if (side === 'SELL' && !bot.balance.asset) {
          get('console').log('[bot] HOLD'.grey)
          return finish()
        }
        else if (side === 'BUY') {
          if (cooldown > 0) {
            get('console').log(('[bot] HOLD too soon to BUY').grey)
            return finish()
          }
          cooldown = bot.cooldown
          var delta = 1 - (tick.close / lastTick.close)
          var price = tick.close + (tick.close * bot.markup) // add markup
          var vwap = runningTotal / runningVol
          var vwapDiff = price - vwap
          var spend
          if (vwapDiff > 0) {
            // buy more when price is rising
            spend = bot.balance.currency * bot.trade_amt
          }
          else {
            // buy less when price is falling
            spend = bot.balance.currency * (1 - bot.trade_amt)
          }
          if (spend / price < bot.min_trade) {
            get('console').log(('[bot] HOLD ' + numeral(delta).format('0.000%')).grey)
            return finish()
          }
          if (sellPrice && price > sellPrice) {
            var sellDelta = 1 - (sellPrice / price)
            if (sellDelta >= bot.buy_for_more) {
              get('console').log(('[bot] refusing to BUY for more (sold for ' + numeral(sellPrice).format('$0,0.00') + ') at ' + numeral(price).format('$0,0.00') + ' ' + numeral(sellDelta).format('0.000%')).red)
              return finish()
            }
          }
          if (delta >= bot.crash_protection) {
            get('console').log(('[bot] refusing to BUY at ' + numeral(price).format('$0,0.00') + ': crash protection ' + numeral(delta).format('0.000%')).red)
            cooldown = 0
            return finish()
          }
          buyPrice = price
          bot.balance.currency -= spend
          var size = spend / price
          tradeVol += size
          bot.balance.asset += size
          var fee = (size * price) * bot.fee
          bot.balance.currency -= fee
          get('console').log(('[bot] BUY ' + numeral(size).format('00.000') + ' BTC at ' + numeral(price).format('$0,0.00') + ' ' + numeral(delta).format('0.000%')).cyan)
        }
        else if (side === 'SELL') {
          if (cooldown > 0) {
            get('console').log(('[bot] HOLD too soon to SELL').grey)
            return finish()
          }
          cooldown = bot.cooldown
          var price = tick.close - (tick.close * bot.markup) // add markup
          var delta = 1 - (lastTick.close / tick.close)
          var vwap = runningTotal / runningVol
          var vwapDiff = price - vwap
          var sell
          if (vwapDiff < 0) {
            // sell more when price is falling
            sell = bot.balance.asset * bot.trade_amt
          }
          else {
            // sell less when price is rising
            sell = bot.balance.asset * (1 - bot.trade_amt) / 2
          }
          if (sell < bot.min_trade) {
            get('console').log(('[bot] HOLD' + numeral(delta).format('0.000%')).grey)
            return finish()
          }
          if (buyPrice && price < buyPrice) {
            var buyDelta = 1 - (price / buyPrice)
            if (buyDelta >= bot.sell_for_less) {
            get('console').log(('[bot] refusing to SELL for less (bought for ' + numeral(buyPrice).format('$0,0.00') + ') at ' + numeral(price).format('$0,0.00') + ' ' + numeral(buyDelta).format('0.000%')).red)
              return finish()
            }
          }
          if (delta >= bot.crash_protection) {
            get('console').log(('[bot] refusing to SELL at ' + numeral(price).format('$0,0.00') + ': crash protection ' + numeral(delta).format('0.000%')).red)
            cooldown = 0
            return finish()
          } 
          sellPrice = price
          bot.balance.asset -= sell
          tradeVol += sell
          bot.balance.currency += sell * price
          var fee = (sell * price) * bot.fee
          bot.balance.currency -= fee
          get('console').log(('[bot] SELL ' + numeral(sell).format('00.000') + ' BTC at ' + numeral(price).format('$0,0.00') + ' ' + numeral(delta).format('0.000%')).cyan)
        }
      }
      finish()
      function finish () {
        lastTick = tick
      }
    }
    function end () {
      var newBalance = JSON.parse(JSON.stringify(bot.balance))
      newBalance.currency += newBalance.asset * lastTick.close
      newBalance.asset = 0
      return newBalance.currency
    }
    function report () {
      if (cooldown) cooldown--
      var date = new Date(lastTick.time)
      var tzMatch = date.toString().match(/\((.*)\)/)
      var time = date.toLocaleString() + ' ' + tzMatch[1]
      if (time.match(/, [^0]:/)) {
        time = time.replace(', ', ', 0')
      }
      var bar = getGraph()
      var newBalance = JSON.parse(JSON.stringify(bot.balance))
      newBalance.currency += newBalance.asset * lastTick.close
      newBalance.asset = 0
      var diff = newBalance.currency - initBalance.currency
      if (diff > 0) diff = ('+' + numeral(diff).format('$0,0.00')).green
      if (diff === 0) diff = ('+' + numeral(diff).format('$0,0.00')).white
      if (diff < 0) diff = (numeral(diff).format('$0,0.00')).red
      //console.log(lastTick)
      get('console').log(bar + ' ' + numeral(lastTick.close).format('$0,0.00').yellow, zerofill(4, numeral(periodVol).format('0'), ' ').white, time.grey, numeral(bot.balance.asset).format('00.000').white + ' BTC/USD '.grey + numeral(bot.balance.currency).format('$,0.00').yellow + ' ' + diff)
    }
    return {
      write: write,
      end: end,
      report: report
    }
  }
}
