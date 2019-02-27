var pivot = require('../pivot/strategy')
var macd = require('../macd/strategy')
var ehlers_ft = require('../ehlers_ft/strategy')
var momentum = require('../momentum/strategy')

var Phenotypes = require('../../../lib/phenotype')

module.exports = {
  name: 'multi',
  description: 'This strategy utilize: pivot macd momentum ehlers_ft.',

  getOptions: function () {
    this.option('period', 'period length, same as --period_length', String, '30m')
    this.option('period_length', 'period length, same as --period', String, '30m')
    
    // PIVOT
    // this.option('period_length', 'period length', String, '30m')
    this.option('min_periods', 'min periods', Number, 50)
    this.option('up', 'up', Number, 1)
    this.option('down','down', Number, 1)

    // MACD / TA_MACD
    //this.option('period', 'period length, same as --period_length', String, '1h')
    //this.option('period_length', 'period length, same as --period', String, '1h')
    //this.option('min_periods', 'min. number of history periods', Number, 52)
    this.option('ema_short_period', 'number of periods for the shorter EMA', Number, 12)
    this.option('ema_long_period', 'number of periods for the longer EMA', Number, 26)
    this.option('signal_period', 'number of periods for the signal EMA', Number, 9)
    this.option('up_trend_threshold', 'threshold to trigger a buy signal', Number, 0)
    this.option('down_trend_threshold', 'threshold to trigger a sold signal', Number, 0)
    this.option('overbought_rsi_periods', 'number of periods for overbought RSI', Number, 25)
    this.option('overbought_rsi', 'sold when RSI exceeds this value', Number, 70)

    // ETHLERS_FT
    //this.option('period', 'period length, same as --period_length', String, '30m')
    //this.option('period_length', 'period length, same as --period', String, '30m')
    this.option('fish_pct_change', 'percent change of fisher transform for reversal', Number, 0)
    this.option('length', 'number of past periods to use including current', Number, 10)
    this.option('src', 'use period.close if not defined. can be hl2, hlc3, ohlc4, HAhlc3, HAohlc4', String, 'hl2')
    this.option('pos_length', 'check this number of previous periods have opposing pos value', Number, 1)

    // MOMENTUM
    //this.option('period', 'period length, same as --period_length', String, '1h')
    //this.option('period_length', 'period length, same as --period', String, '1h')
    this.option('momentum_size', 'number of periods to look back for momentum', Number, 5)
  },

  calculate: function (s) {
    pivot.calculate(s)
    macd.calculate(s)
    ehlers_ft.calculate(s)
    momentum.calculate(s)
  },

  onPeriod: function (s, cb) {
    let totalBuy = 0
    let totalSell = 0
    if(s && s.lookback && s.lookback.constructor === Array && s.lookback.length > 5 && s.lookback[1].high && s.lookback[5].high) {
      pivot.onPeriod(s, function(){})
      if(s.signal == 'buy') 
        totalBuy += 1
      if(s.signal == 'sell') 
        totalSell += 1
    }
    macd.onPeriod(s, function(){})
    if(s.signal == 'buy') 
      totalBuy += 1
    if(s.signal == 'sell') 
      totalSell += 1
    ehlers_ft.onPeriod(s, function(){})
    if(s.signal == 'buy') 
      totalBuy += 1
    if(s.signal == 'sell') 
      totalSell += 1
    momentum.onPeriod(s, function(){})
    if(s.signal == 'buy') 
      totalBuy += 1
    if(s.signal == 'sell') 
      totalSell += 1
    
    s.signal = null
    if(totalBuy >= 2 && totalBuy >= totalSell && totalSell == 0)
      s.signal = 'buy'
    if(totalSell >= 2 && totalSell >= totalBuy && totalBuy == 0)
      s.signal = 'sell'

    if(s.signal == 'buy' && s.stopTriggered) {
      s.stopTriggered = false
    }

    if(s.signal == 'sell' && s.stopTriggered) {
      s.signal = null
    }
    return cb()
  },

  onReport: function (s) {
    var cols = []
    return cols.concat(pivot.onReport(s), macd.onReport(s), ehlers_ft.onReport(s), momentum.onReport(s))
  },

  phenotypes: {
    // -- common
    period_length: Phenotypes.RangePeriod(1, 60, 'm'),
    min_periods: Phenotypes.Range(1, 200),
    markdown_buy_pct: Phenotypes.RangeFloat(-1, 5),
    markup_sell_pct: Phenotypes.RangeFloat(-1, 5),
    order_type: Phenotypes.ListOption(['maker', 'taker']),
    //sell_stop_pct: Phenotypes.Range0(1, 50),
    //buy_stop_pct: Phenotypes.Range0(1, 50),
    //profit_stop_enable_pct: Phenotypes.Range0(1, 20),
    //profit_stop_pct: Phenotypes.Range(1,20),
    sell_stop_pct: Phenotypes.RangeFloat(0.4, 0.6),
    //profit_stop_enable_pct: Phenotypes.RangeFloat(0.5, 1),
    //quarentine_time: Phenotypes.ListOption([240, 270, 300]),

    // macd
    ema_short_period: Phenotypes.Range(1, 20),
    ema_long_period: Phenotypes.Range(20, 100),
    signal_period: Phenotypes.Range(1, 20),
    up_trend_threshold: Phenotypes.Range(0, 50),
    down_trend_threshold: Phenotypes.Range(0, 50),
    overbought_rsi_periods: Phenotypes.Range(1, 50),
    overbought_rsi: Phenotypes.Range(20, 100),

    // ehlers_ft
    length: Phenotypes.Range(1, 30),
    fish_pct_change: Phenotypes.Range(-25, 75),
    pos_length: Phenotypes.Range(1, 6),
    src: Phenotypes.ListOption(['close', 'hl2', 'hlc3', 'ohlc4', 'HAhlc3', 'HAohlc4']),

    // momentum
    momentum_size: Phenotypes.Range(1,20)
  }
}

