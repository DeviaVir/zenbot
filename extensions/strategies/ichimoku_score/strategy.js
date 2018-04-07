
//                    ======= Ichimoku Signals Score =======

/*

The Ichimoku signals, indeed all Ichimoku elements, should never be taken in isolation, but considered in the context
of the overall chart.  Ichimoku Kinko Hyo is a visual technical analysis system and the charts are designed to be
considered in their entirety, with regard given to the relationships between all of the elements, including the price.
As such, Ichimoku is not suitable for automated or "single event" decision making.

Remember that Ichimoku Kinko Hyo is a technical trend trading charting system and trends can and do change, so your
readings of the charts should be probabilistic, rather than predictive.  As with most technical analysis methods,
Ichimoku is likely to produce frequent conflicting signals in non-trending markets.

The five kinds of signal are described below.  Most can be classified as strong, neutral, or weak by their proximate
relationship to the Kumo (cloud), but each signal may be further strengthened, weakened, or nullified by the
relationships between other elements.  All signals must be considered in respect to the overall chart.

For a better understanding of how to read ichimoku please refer to http://www.ichimokutrader.com/signals.html
Code based on a TradingView.com script at https://www.tradingview.com/v/u0NN8zNu/

If you appreciate the work and the man hours that went into creating this strategy, please consider giving back.
LoneWolf345 ETH = 0xa42f6d21f1e52f7fbaeaa0f58d1cc4b9a58f2dcc , BTC = 15L8QstCQG4ho6139hVaqLxkAzcjnqBbf6
Travis      ETH = 0xdA963A127BeCB08227583d11f912F400D5347060 , BTC = 3KKHdBJpEGxghxGazoE4X7ihyr2q6nHUvW

*/


let z = require('zero-fill')
  , n = require('numbro')
  , Phenotypes = require('../../../lib/phenotype')
  , crossover = require('../../../lib/helpers').crossover
  , crossunder = require('../../../lib/helpers').crossunder

module.exports = {
  name: 'ichimoku_score',
  description: 'Associate various ichimoku signals with a score.',

  getOptions: function () {
    this.option('period', 'period length eg 10m', String, '60m')
    this.option('min_periods', 'min. number of history periods', Number, 150)

    // == ichimoku inputs ==
    this.option('tenkenSenPeriods', 'Tenkan-sen (Conversion Line) Periods', Number, 9)                           //default 9
    this.option('kijunSenPeriods', 'Kijun-sen (Base Line) Periods', Number, 26)                                  //default 26
    this.option('senkouSpanPeriods', 'Senkou (Leading) Span B Periods', Number, 52)                              //default 52
    this.option('displacement', 'Displacement', Number, 26)                                                      //default 26

    // == score inputs ==
    this.option('tkCrossWeight', 'TK Cross Importance Weight', Number, 1)                                        //range 0 - 2 Default = 1
    this.option('pkCrossWeight', 'PK Cross Importance Weight', Number, 1)                                        //range 0 - 2 Default = 1
    this.option('kumoBreakoutWeight', 'Kumo Breakout Importance Weight', Number, 1)                              //range 0 - 2 Default = 1
    this.option('senkouCrossWeight', 'Senkou (Leading) Span Cross Importance Weight', Number, 1)                 //range 0 - 2 Default = 1
    this.option('chikouCrossWeight', 'Chikou (Lagging) Span Cross Importance Weight', Number, 1)                 //range 0 - 2 Default = 1
    this.option('chikouPlacementWeight', 'Chikou (Lagging) Span Relative to Cloud Importance Weight', Number, 1) //range 0 - 2 Default = 1
    this.option('pricePlacementWeight', 'Price Relative to Cloud Importance Weight', Number, 1)                  //range 0 - 2 Default = 1

    this.option('weakPoints', 'Weak Point Value', Number, 0.5)                                                   //range 0 - 2 Default = 0.5
    this.option('neutralPoints', 'Neutral Point Value', Number, 1)                                               //range 0 - 2 Default = 1
    this.option('strongPoints', 'Strong Point Value', Number, 2)                                                 //range 0 - 2 Default = 2

    this.option('buyLevel', 'when to signal buy', Number, 50)                                                    //range -100 - 100 Default = 50
    this.option('sellLevel', 'when to signal sell', Number, 50)                                                  //range -100 - 100 Default = 50

  },

  calculate: function (s) {

    if (s.lookback.length > s.options.min_periods) {



      // == == generate ichimoku data == ==


      s.period.tenkenSen = donchian(s, s.options.tenkenSenPeriods)
      s.period.kijunSen = donchian(s, s.options.kijunSenPeriods)

      s.period.senkouA = (s.period.tenkenSen + s.period.kijunSen) / 2
      s.period.senkouB = donchian(s, s.options.senkouSpanPeriods)

      // have to wait until displacement periods have passed
      if (s.lookback.length > s.options.displacement) {

        s.lookback[s.options.displacement].chikouSen = s.period.close

        s.priceAboveKumo = valueAbove(s.period.close, s.period.senkouA, s.period.senkouB)
        s.priceBelowKumo = valueBelow(s.period.close, s.period.senkouA, s.period.senkouB)
        s.priceInsideKumo = !s.priceAboveKumo && !s.priceBelowKumo

        // == == calculate score == ==


        s.period.tkCrossScore = calcTkCross(s, s.lookback[0].tkCrossScore)
        s.period.pkCrossScore = calcPkCross(s, s.lookback[0].pkCrossScore)
        s.period.kumoBreakoutScore = calcKumoBreakout(s, s.lookback[0].kumoBreakoutScore)
        s.period.senkouCrossScore =  calcSenkouCross(s, s.lookback[0].senkouCrossScore)
        s.period.chikouCrossScore = calcChikouCross(s, s.lookback[0].chikouCrossScore)
        s.period.pricePlacementScore = calcPricePlacement(s, s.lookback[0].pricePlacementScore)
        s.period.chikouPlacementScore = calcChikouPlacement(s, s.lookback[0].chikouPlacementScore)

        s.totalScore = (s.options.tkCrossWeight * s.period.tkCrossScore)
        s.totalScore += (s.options.pkCrossWeight * s.period.pkCrossScore)
        s.totalScore += (s.options.kumoBreakoutWeight * s.period.kumoBreakoutScore)
        s.totalScore += (s.options.senkouCrossWeight * s.period.senkouCrossScore)
        s.totalScore += (s.options.chikouCrossWeight * s.period.chikouCrossScore)
        s.totalScore += (s.options.pricePlacementWeight * s.period.pricePlacementScore)
        s.totalScore += (s.options.chikouPlacementWeight * s.period.chikouPlacementScore)

        let maxScore = s.options.strongPoints * (s.options.tkCrossWeight + s.options.pkCrossWeight + s.options.kumoBreakoutWeight + s.options.senkouCrossWeight + s.options.chikouCrossWeight + s.options.pricePlacementWeight + s.options.chikouPlacementWeight)
        s.normalizedScore = 100 * s.totalScore / maxScore

      }
    }
  },

  onPeriod: function (s, cb) {


   //    == Debugging ==

    if (s.options.debug) {console.log('\n== Options ==')}

    if (s.options.debug) {console.log('tenkenSenPeriods: ' + s.options.tenkenSenPeriods)}
    if (s.options.debug) {console.log('kijunSenPeriods: ' + s.options.kijunSenPeriods)}
    if (s.options.debug) {console.log('senkouSpanPeriods: ' + s.options.senkouSpanPeriods)}
    if (s.options.debug) {console.log('displacement: ' + s.options.displacement)}

    if (s.options.debug) {console.log('buyLevel: ' + s.options.buyLevel)}
    if (s.options.debug) {console.log('sellLevel: ' + s.options.sellLevel)}


    if (s.options.debug) {console.log('\n== Ichimoku Data ==')}

    if (s.options.debug) {console.log('Tenken-Sen (conversion Line):' + s.period.tenkenSen)}
    if (s.options.debug) {console.log('Kijun-Sen (Base Line):' + s.period.kijunSen)}
    if (s.options.debug) {console.log('senkouA (Leading):' + s.period.senkouA)}
    if (s.options.debug) {console.log('senkouB (Leading):' + s.period.senkouB)}


    if (s.options.debug) {console.log('\n== Calculate Score ==')}

    if (s.options.debug) {console.log('tkCrossScore:' + s.period.tkCrossScore)}
    if (s.options.debug) {console.log('pkCrossScore:' + s.period.pkCrossScore)}
    if (s.options.debug) {console.log('kumoBreakoutScore:' + s.period.kumoBreakoutScore)}
    if (s.options.debug) {console.log('senkouCrossScore:' + s.period.senkouCrossScore)}
    if (s.options.debug) {console.log('chikouCrossScore:' + s.period.chikouCrossScore)}
    if (s.options.debug) {console.log('pricePlacementScore:' + s.period.pricePlacementScore)}
    if (s.options.debug) {console.log('chikouPlacementScore:' + s.period.chikouPlacementScore)}


    if (s.options.debug) {console.log('\n== Buy / Sell signals ==')}

    if (s.options.debug) {console.log('normalizedScore:' + s.normalizedScore)}
    if (s.options.debug) {console.log('previousScore:' + s.previousScore)}
    if (s.options.debug) {console.log('buy logic')}
    if (s.options.debug) {console.log('if (s.normalizedScore > s.options.buyLevel && s.previousScore < s.options.buyLevel)')}
    if (s.options.debug) {console.log('if (' + s.normalizedScore + ' > ' + s.options.buyLevel + ' && ' + s.previousScore + ' < ' + s.options.buyLevel + ')')}
    if (s.options.debug) {console.log(s.normalizedScore > s.options.buyLevel && s.previousScore < s.options.buyLevel)}



    // == == Buy / Sell Signals == ==



    if (!s.previousScore) {s.previousScore = 0}

    if (s.normalizedScore > s.options.buyLevel && s.previousScore < s.options.buyLevel) {
      s.signal = 'buy'
      s.previousScore = s.normalizedScore
    } else if (s.normalizedScore < s.options.sellLevel && s.previousScore > s.options.sellLevel) {
      s.signal = 'sell'
      s.previousScore = s.normalizedScore
    } else {
      s.signal = null
      s.previousScore = s.normalizedScore
    }

    cb()
  },

  onReport: function (s) {
    var cols = []
    let color = 'cyan'

    if (s.normalizedScore > 50) { color = 'green' } else if (s.normalizedScore < -50) { color = 'red' }
    cols.push(z(10, 'S[' + n(s.normalizedScore).format('###.0') + ']', '')[color])

    return cols
  },

  phenotypes: {

    //General Options
    period_length: Phenotypes.RangePeriod(45, 240, 'm'),
    min_periods: Phenotypes.Range(150, 150), //Needs to be greater than senkouSpanPeriods
    markdown_buy_pct: Phenotypes.RangeFloat(0, 0),
    markup_sell_pct: Phenotypes.RangeFloat(0, 0),
    order_type: Phenotypes.ListOption(['maker', 'taker']),
    sell_stop_pct: Phenotypes.Range0(1, 50),
    buy_stop_pct: Phenotypes.Range0(1, 50),
    profit_stop_enable_pct: Phenotypes.Range(1, 20),
    profit_stop_pct: Phenotypes.Range(1,10),

    //Strategy Specific
    buyLevel: Phenotypes.RangeFactor(5, 100, 5),
    sellLevel: Phenotypes.RangeFactor(5, 100, 5),

    tenkenSenPeriods: Phenotypes.RangeFactor(5, 30, 1),
    kijunSenPeriods: Phenotypes.RangeFactor(25, 75, 1),
    senkouSpanPeriods: Phenotypes.RangeFactor(50, 150, 1),
    displacement: Phenotypes.RangeFactor(20, 40, 1)

  }
}






// == == Helpers == ==



function resolve(src, fallback) { return isNaN(src) ? fallback : src}


function donchian(s, len) {

  let data = s.lookback.slice(0, len - 1),
    lowData = [s.period.low, ...data.map(p => p.low)],
    highData = [s.period.high, ...data.map(p => p.high)]

  return (Math.min(...lowData) + Math.max(...highData)) / 2

}


function getIntersect(s, key1, key2) {

  return (s.lookback[0][key1] * (s.period[key2] - s.lookback[0][key2]) -
    s.lookback[0][key2] * (s.period[key1] - s.lookback[0][key1])) /
      ((s.period[key2] - s.lookback[0][key2]) - (s.period[key1] - s.lookback[0][key1]))
}

function belowKumo(s, key, key1, key2) {

  return valueBelowKumo(s, s.period[key], key1, key2)
}
function aboveKumo(s, key, key1, key2) {

  return valueAboveKumo(s, s.period[key], key1, key2)
}

function valueBelowKumo(s, val, key1, key2) {

  if(s.lookback.length >= s.options.displacement)
    return valueBelow(val, s.lookback[s.options.displacement][key1], s.lookback[s.options.displacement][key2])
  else
    throw 'belowKumo, s.lookback.length < s.options.displacement'
}

function valueAboveKumo(s, val, key1, key2) {

  if(s.lookback.length >= s.options.displacement)
    return valueAbove(val, s.lookback[s.options.displacement][key1], s.lookback[s.options.displacement][key2])
  else
    throw 'aboveKumo, s.lookback.length < s.options.displacement'
}

function valueAbove(val, target1, target2) {
    return val > Math.max(target1, target2)
}

function valueBelow(val, target1, target2) {
  return val < Math.min(target1, target2)
}



// == == ichimoku cloud signals == ==





// == Tenkan Sen (turning line) / Kijun Sen (standard line) Cross ==
function calcTkCross(s, previousVal) {

  let bullish = crossover(s, 'tenkenSen', 'kijunSen')
  let bearish = crossunder(s, 'tenkenSen', 'kijunSen')

  let intersect = getIntersect(s, 'tenkenSen', 'kijunSen')
  let above = valueAboveKumo(s, intersect, 'senkouA', 'senkouB')
  let below = valueBelowKumo(s, intersect, 'senkouA', 'senkouB')
  let inside = !above && !below

  let score =  resolve(previousVal, 0)
  if (bullish && below) {score = s.options.weakPoints}      //A weak bullish signal occurs when the cross is below the Kumo.
  if (bullish && inside) {score = s.options.neutralPoints}  //A neutral bullish signal occurs when the cross is inside the Kumo.
  if (bullish && above) {score = s.options.strongPoints}    //A strong bullish signal occurs when the cross is above the Kumo.
  if (bearish && below) {score = -s.options.strongPoints}   //A strong bearish signal occurs when the cross is below the Kumo.
  if (bearish && inside) {score = -s.options.neutralPoints} //A neutral bearish signal occurs when the cross is inside the Kumo.
  if (bearish && above) {score = -s.options.weakPoints}     //A weak bearish signal occurs when the cross is above the Kumo.

  return (score)

}

// == Price and Kijun Sen (standard line) Cross ==
function calcPkCross(s, previousVal) {

  let bullish = crossover(s, 'close', 'kijunSen')
  let bearish = crossunder(s, 'close', 'kijunSen')

  let intersect = getIntersect(s, 'close', 'kijunSen')
  let above = valueAboveKumo(s, intersect, 'senkouA', 'senkouB')
  let below = valueBelowKumo(s, intersect, 'senkouA', 'senkouB')
  let inside = !above && !below

  let score =  resolve(previousVal, 0)
  if (bullish && below) {score = s.options.weakPoints}      //A weak bullish signal occurs when the cross is below the Kumo.
  if (bullish && inside) {score = s.options.neutralPoints}  //A neutral bullish signal occurs when the cross is inside the Kumo.
  if (bullish && above) {score = s.options.strongPoints}    //A strong bullish signal occurs when the cross is above the Kumo.
  if (bearish && below) {score = -s.options.strongPoints}   //A strong bearish signal occurs when the cross is below the Kumo.
  if (bearish && inside) {score = -s.options.neutralPoints} //A neutral bearish signal occurs when the cross is inside the Kumo.
  if (bearish && above) {score = -s.options.weakPoints}     //A weak bearish signal occurs when the cross is above the Kumo.

  return (score)

}

// == Kumo Breakouts ==
function calcKumoBreakout(s, previousVal) {

  let bullish = (crossover(s, 'close', 'senkouA') && s.period.senkouA >= s.period.senkouB) || (crossover(s, 'close', 'senkouB') && s.senkouB >= s.senkouA)
  let bearish = (crossunder(s, 'close', 'senkouB') && s.period.senkouA >= s.period.senkouB) || (crossover(s, 'close', 'senkouA') && s.senkouB >= s.senkouA)

  let score =  resolve(previousVal, 0)
  if (bullish) {score = s.options.strongPoints}  //A bullish signal occurs when the price goes upwards through the top of the Kumo.
  if (bearish) {score = -s.options.strongPoints} //A bearish signal occurs when the price goes downwards through the bottom of the Kumo.

  return (score)

}

// == Senkou Span Cross ==
// The Senkou Span Cross signal occurs when the Senkou Span A (1st leading line) crosses the Senkou Span B (2nd leading line).
// NOTE: this cross occurs ahead of the price, since it's displaced to the right; this displacement must be removed
function calcSenkouCross(s, previousVal) {

  s.period.noDpsenkouA = (s.period.tenkenSen + s.period.kijunSen) / 2 //Senkou Span A (no displacement)
  s.period.noDpsenkouB = donchian(s, s.options.senkouSpanPeriods) //senkou Span B (no displacement)

  let bullish = crossover(s, 'noDpsenkouA', 'noDpsenkouB')
  let bearish = crossunder(s, 'noDpsenkouA', 'noDpsenkouB')

  let score =  resolve(previousVal, 0)
  if (bullish && s.priceBelowKumo) {score = s.options.weakPoints}      //A weak bullish signal occurs if the current price is below the Kumo.
  if (bullish && s.priceInsideKumo) {score = s.options.neutralPoints}  //A neutral bullish signal occurs if the current price is inside the Kumo.
  if (bullish && s.priceAboveKumo) {score = s.options.strongPoints}    //A strong bullish signal occurs if the current price is above the Kumo.
  if (bearish && s.priceBelowKumo) {score = -s.options.strongPoints}   //A strong bearish signal occurs if the current price is below the Kumo.
  if (bearish && s.priceInsideKumo) {score = -s.options.neutralPoints} //A neutral bearish signal occurs if the current price is inside the Kumo.
  if (bearish && s.priceAboveKumo) {score = -s.options.weakPoints}     //A weak bearish signal occurs if the current price is above the Kumo.

  return (score)

}

// == Chikou Span Cross ==
// The Chikou Span Cross signal occurs when the Chikou Span (Lagging line) rises above or falls below the price.
function calcChikouCross(s, previousVal) {

  s.period.leadline = s.lookback[s.options.displacement].close//offset(s.period.close, s.options.displacement)
  let bullish = crossover(s, 'close', 'leadline')
  let bearish = crossunder(s, 'close', 'leadline')

  let score =  resolve(previousVal, 0)
  if (bullish && s.priceBelowKumo) {score = s.options.weakPoints}      //A weak bullish signal occurs if the current price is below the Kumo.
  if (bullish && s.priceInsideKumo) {score = s.options.neutralPoints}  //A neutral bullish signal occurs if the current price is inside the Kumo.
  if (bullish && s.priceAboveKumo) {score = s.options.strongPoints}    //A strong bullish signal occurs if the current price is above the Kumo.
  if (bearish && s.priceBelowKumo) {score = -s.options.strongPoints}   //A weak bearish signal occurs if the current price is above the Kumo.
  if (bearish && s.priceInsideKumo) {score = -s.options.neutralPoints} //A neutral bearish signal occurs if the current price is inside the Kumo.
  if (bearish && s.priceAboveKumo) {score = -s.options.weakPoints}     //A strong bearish signal occurs if the current price is below the Kumo.

  return (score)

}


// == price relative to cloud ==
function calcPricePlacement(s, previousVal) {

  let score =  resolve(previousVal, 0)
  if (s.priceAboveKumo) {score = s.options.strongPoints}
  if (s.priceInsideKumo) {score = s.options.neutralPoints}
  if (s.priceBelowKumo) {score = -s.options.strongPoints}

  return (score)

}



// == lag line releative to cloud ==
function calcChikouPlacement(s, previousVal) {

  let score =  resolve(previousVal, 0)
  if(s.lookback.length >= s.options.displacement) {
    // above
    if(aboveKumo(s, 'close', 'senkouA', 'senkouB'))
      score = s.options.strongPoints
    // below
    else if(belowKumo(s, 'close', 'senkouA', 'senkouB'))
      score = -s.options.strongPoints
    else
      score = 0
  }

  return (score)
}