import { getMaTypeFromString } from '../util/ma-type'
const talib = require('talib')

export default (s, key, rsi_periods, k_periods, d_periods, d_ma_type, optMarket?) => {
  return new Promise(function(resolve, reject) {
    // Returns the parameters needed to execute left comment for latter reference
    //var o = talib.explain('STOCHRSI')

    let tmpMarket = optMarket
    if (!tmpMarket) {
      tmpMarket = s.lookback.slice(0, 1000).map((x) => x.close)
      tmpMarket.reverse()
      //add current period
      tmpMarket.push(s.period.close)
    } else {
      tmpMarket = tmpMarket.map((x) => x.close)
    }

    //dont calculate until we have enough data
    if (tmpMarket.length > rsi_periods) {
      //doublecheck length.
      if (tmpMarket.length >= rsi_periods) {
        // extract int from string input for ma_type
        let optInMAType = getMaTypeFromString(d_ma_type)
        talib.execute(
          {
            name: 'STOCHRSI',
            startIdx: 0,
            endIdx: tmpMarket.length - 1,
            inReal: tmpMarket,
            optInTimePeriod: rsi_periods, //RSI 14 default
            optInFastK_Period: k_periods, // K 5 default
            optInFastD_Period: d_periods, // D 3 default
            optInFastD_MAType: optInMAType, // type of Fast D default 0
          },
          function(err, result) {
            if (err) {
              console.log(err)
              reject(err)
              return
            }

            resolve({
              outFastK: result.result.outFastK,
              outFastD: result.result.outFastD,
            })
          }
        )
      } else {
        resolve()
      }
    } else {
      resolve()
    }
  })
}
