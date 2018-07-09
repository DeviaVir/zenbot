var tulind = require('tulind')


module.exports = function ti_rsi(s, key, rsi_period,  optMarket) 
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

    if ( tmpMarket.length >= rsi_period) {
      //doublecheck length.
      if (tmpMarket.length >= rsi_period) {
        // extract int from string input for ma_type
         
        tulind.indicators.rsi.indicator(
          [tmpMarket],
          [rsi_period]
          , function (err, result) {
            if (err) {
              console.log(err)
              reject(err, result)
              return
            }
            resolve({
              rsi: result[0]
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


