var tulind = require('tulind')


module.exports = function ti_stochrsi(s, key, rsi_period, k_periods, d_periods, optMarket) 
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
            let trsi = result[0]
            // 0 oldest -- end newest
            trsi.reverse()
            let stochRSI = []

            for(let i = 0; i < (k_periods + d_periods - 1); i++) {
              let rsiForPeriod = trsi.slice(i, rsi_period + i)
              let highestRSI = Math.max(...rsiForPeriod)
              let lowestRSI = Math.min(...rsiForPeriod)
              
              if(highestRSI == lowestRSI) {
                stochRSI.push(0)
              } else {
                stochRSI.push(((trsi[ (rsi_period - 1) + i] - lowestRSI) / (highestRSI - lowestRSI)) )
              }
            }
        
            let percentK = []
            for(let i = 0; i < k_periods; i++) {
              let kData = stochRSI.slice(i, k_periods + i)
              if(kData.length == k_periods) {
                percentK.push(kData.reduce((a,b) => a + b, 0) / kData.length )
              }
            }
      
            let percentD = []
            for(let i = 0; i < d_periods; i++) {
              let dData = stochRSI.slice(i, d_periods + i)
              if(dData.length == d_periods) {
                percentD.push(dData.reduce((a,b) => a + b, 0) / dData.length)
              }
            }
      
   

            resolve({
              stochRSI: stochRSI,
              stochk :percentK,
              stochd :percentD
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


