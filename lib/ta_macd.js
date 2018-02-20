var talib = require('talib')

module.exports = function macd (s, macd_key,hist_key,sig_key, slow_period,fast_period,signal_period) {
  //check parameters
  // if (fast_period > slow_period) {
  //   console.log('incorrect parameters MACD. (fast_period < slow_period || signal_period > fast_period)')
  //   return;
  // }
  //create object for talib. only close is used for now but rest might come in handy
  if (!s.marketData) {
    s.marketData = { open: [], close: [], high: [], low: [], volume: [] }
  }
  if (s.lookback.length > s.marketData.close.length) {
    for (var i = (s.lookback.length - s.marketData.close.length) - 1; i >= 0; i--) {
      //console.log('add data')
      s.marketData.close.push(s.lookback[i].close)
    }
  }
  var periods_necessary = slow_period + signal_period - 1
  //dont calculate until we have enough data
  if (s.marketData.close.length >= periods_necessary) {
    //fillup marketData for talib.
    var tmpMarket = JSON.parse(JSON.stringify(s.marketData.close))
    //add current period
    tmpMarket.push(s.period.close)

    talib.execute({
      name: 'MACD',
      startIdx: 0,
      endIdx: tmpMarket.length -1,
      inReal: tmpMarket,
      optInFastPeriod: fast_period,
      optInSlowPeriod: slow_period,
      optInSignalPeriod: signal_period
    }, function (err, result) {
      if (err) {
        console.log(err)
        return
      }
      //Result format: (note: outReal  can have multiple items in the array)
      // {
      //   begIndex: 8,
      //   nbElement: 1,
      //   result: { outReal: [ 1820.8621111111108 ] }
      // }
      // console.log(JSON.stringify(marketData))
      // console.log(JSON.stringify(result.result))
      s.period[macd_key] = result.result.outMACD[(result.nbElement - 1)]
      s.period[hist_key] = result.result.outMACDHist[(result.nbElement - 1)]
      s.period[sig_key] = result.result.outMACDSignal[(result.nbElement - 1)]
    })

  }
}

