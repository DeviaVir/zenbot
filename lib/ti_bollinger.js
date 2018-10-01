var tulind = require('tulind')


module.exports = function ti_bollinger(s, key, rsi_periods, StdDev, optMarket) 
{
 
  return new Promise(function(resolve, reject) {

    //dont calculate until we have enough data
 
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
    if ( tmpMarket.length >= rsi_periods) {
      //doublecheck length.
      if (tmpMarket.length >= rsi_periods) {
        // extract int from string input for ma_type
         
        tulind.indicators.bbands.indicator(
          [tmpMarket],
          [rsi_periods, StdDev]
          , function (err, result) {
            if (err) {
              console.log(err)
              reject(err, result)
              return
            }

            resolve({
              LowerBand: result[0],
              MiddleBand: result[1],
              UpperBand: result[2]
           
            })
          })
      }
      else {
        reject('MarketLenth not populated enough')
      }
 
    } else {
      reject('MarketLenth not populated enough')}
  })
}


