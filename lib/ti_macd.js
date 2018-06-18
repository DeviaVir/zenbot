var tulind = require('tulind')


module.exports = function macd(s, key, shortPeriod, longPeriod, signalPeriod ,optMarket) 
{
  return new Promise(function(resolve, reject) {
  
    if (s.lookback.length >= Math.max(shortPeriod,longPeriod) ) {

      let tmpMarket = optMarket
      if (!tmpMarket)
      {
        tmpMarket = s.lookback.slice(0, 1000).map(x=>x.close)
        tmpMarket.reverse()
        //add current period
        tmpMarket.push(s.period.close)
      }
      else
      {
        tmpMarket = tmpMarket.map(x=>x.close)
      }
      tulind.indicators.macd.indicator(
        [tmpMarket],
        [shortPeriod, longPeriod, signalPeriod]
        , function (err, result) {
          if (err) {
            console.log(err)
            reject(err, result)
            return
          }

          resolve({
            macd: result[0],
            macd_signal: result[1],
            macd_histogram: result[2]
          })
        })
         
    }
    else
    { 
      reject()
    }
  })
}

