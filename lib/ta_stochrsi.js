var talib = require('talib')

module.exports = function srsi(s, key, rsi_periods, k_periods, d_periods, d_ma_type, optMarket) 
{
  return new Promise(function(resolve, reject) {
  


    // Returns the parameters needed to execute left comment for latter reference
    //var o = talib.explain('STOCHRSI')

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


    //dont calculate until we have enough data
    if (tmpMarket.length > rsi_periods) {
       
      //doublecheck length.
      if (tmpMarket.length >= rsi_periods) {
        // extract int from string input for ma_type
        let optInMAType = getMaTypeFromString(d_ma_type)
        talib.execute({
          name: 'STOCHRSI',
          startIdx:  0 ,
          endIdx: tmpMarket.length -1,
          inReal: tmpMarket,
          optInTimePeriod: rsi_periods,  //RSI 14 default
          optInFastK_Period:k_periods, // K 5 default
          optInFastD_Period:d_periods, // D 3 default
          optInFastD_MAType:optInMAType // type of Fast D default 0 

        }, function (err, result) {
          if (err) {
            console.log(err)
            reject(err, result)
            return
          }

          resolve({
            outFastK: result.result.outFastK,
            outFastD: result.result.outFastD
          })
  

        })
      }
      else {
        resolve()
      }
    }
    else
    {
      resolve()
    }

  })
}

/**
     * Extract int from string input eg (SMA = 0)
     *
     * @see https://github.com/oransel/node-talib
     * @see https://github.com/markcheno/go-talib/blob/master/talib.go#L20
     */
function getMaTypeFromString(maType) {
  // no constant in lib?
    
  switch (maType.toUpperCase()) {
  case 'SMA':
    return 0
  case 'EMA':
    return 1
  case 'WMA':
    return 2
  case 'DEMA':
    return 3
  case 'TEMA':
    return 4
  case 'TRIMA':
    return 5
  case 'KAMA':
    return 6
  case 'MAMA':
    return 7
  case 'T3':
    return 8
  default:
    return 0
  }
}
