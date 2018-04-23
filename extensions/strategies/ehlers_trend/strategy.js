let z = require('zero-fill')
  , n = require('numbro')
  , Phenotypes = require('../../../lib/phenotype')
  , crossover = require('../../../lib/helpers').crossover
  , crossunder = require('../../../lib/helpers').crossunder
  , nz = require('../../../lib/helpers').nz
  , tv = require('../../../lib/helpers')

module.exports = {
  name: 'Ehlers_Trend',
  description: 'Ehlers Instantaneous Trend',

  getOptions: function () {
    this.option('period', 'period length, same as --period_length', String, '30m')
    this.option('period_length', 'period length, same as --period', String, '30m')

    this.option('alpha', '', Number, 0.07)
    this.option('price_source', '', String, 'HAohlc4')
  },

  calculate: function () {},

  onPeriod: function (s, cb) {

    if (s.lookback.length > s.options.min_periods) {

      if(!s.options.price_source || s.options.price_source === 'close'){
        s.period.src = s.period.close
      } else if (s.options.price_source === 'hl2'){
        s.period.src = tv.hl2(s)
      } else if (s.options.price_source === 'hlc3'){
        s.period.src = tv.hlc3(s)
      } else if (s.options.price_source === 'ohlc4'){
        s.period.src = tv.ohlc4(s)
      } else if (s.options.price_source === 'HAhlc3'){
        s.period.src = tv.HAhlc3(s)
      } else if (s.options.price_source === 'HAohlc4'){
        s.period.src = tv.HAohlc4(s)
      }
    
      let a = s.options.alpha
      if (s.lookback.length < 7) {
        s.period.trend =  (s.period.src + 2 * nz(s.lookback[0].src) + nz(s.lookback[1].src)) / 4
      } else {
        s.period.trend = (a-a*a/4.0)*s.period.src+0.5*a*a*nz(s.lookback[0].src)-(a-0.75*a*a)*nz(s.lookback[1].src)+2*(1-a)*nz(s.lookback[0].trend) - (1-a)*(1-a)*nz(s.lookback[1].trend)
        s.period.trigger = 2.0*s.period.trend-nz(s.lookback[1].trend)
      }
    }


    if(crossover(s, 'trend', 'trigger'))
      s.signal = 'sell'
    else if(crossunder(s, 'trend', 'trigger'))
      s.signal = 'buy'
    else
      s.signal = null

    cb()
  },

  onReport: function (s) {
    var cols = []
    let color = 'cyan'
    if (s.period.trend > s.period.trigger) { color = 'red' } else if (s.period.trend < s.period.trigger) { color = 'green' }
    cols.push(z(10, 'Trend[' + n(s.period.trend).format('###.0') + ']', '')[color])
    cols.push(z(10, ' trigger[' + n(s.period.trigger).format('###.0') + ']', '')[color])
    return cols
  },

  phenotypes: {

    // -- common
    period_length: Phenotypes.RangePeriod(15, 120, 'm'),
    markdown_buy_pct: Phenotypes.RangeFloat(-1, 3),
    markup_sell_pct: Phenotypes.RangeFloat(-1, 3),
    order_type: Phenotypes.ListOption(['maker', 'taker']),
    profit_stop_enable_pct: Phenotypes.Range0(1, 20),
    profit_stop_pct: Phenotypes.Range(1,20),
    
    //Strategy Specific
    alpha: Phenotypes.RangeFactor(0.01, 0.2, 0.01)


  }
}

