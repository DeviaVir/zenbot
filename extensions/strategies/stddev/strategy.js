var z = require('zero-fill')
  , stats = require('stats-lite')
  , math = require('mathjs')
  , ema = require('../../../lib/ema')
  , Phenotypes = require('../../../lib/phenotype')

  var trending_up = false
module.exports = {
  name: 'stddev',
  description: 'Buy when standard deviation and mean increase, sell on mean decrease.',
  getOptions: function () {
    this.option('period', 'period length, set poll trades to 100ms, poll order 1000ms. Same as --period_length', String, '5m')
    this.option('period_length', 'period length, set poll trades to 100ms, poll order 1000ms. Same as --period', String, '5m')
    this.option('trendtrades', 'Trades for array 2 to be calculated stddev and mean from', Number, 1000)
    this.option('min_periods', 'min_periods', Number, 1001)
	this.option('order_adjust_time' 'Order Adjust Time', Number, 999999)
  },
  calculate: function () {
  },
  onPeriod: function (s, cb) {
    ema(s, 'stddev', s.options.stddev)
    var tl1 = []
    if (s.lookback[s.options.min_periods]) {
      for (let i = 0; i < s.options.trendtrades; i++) { tl1.push(s.lookback[i].close) }
      let strategy = {
            stddev: stats.stdev(tl1),
            mean: stats.mean(tl1),
            last_trade_price: s.lookback[0].close,
            trades_n: s.options.trendtrades_2,
        }
      strategy.diff_price_and_mean = strategy.last_trade_price - strategy.mean
      strategy.direction = (Math.abs(strategy.diff_price_and_mean) === strategy.diff_price_and_mean) ? 'Up' : 'Down';
        if (
            strategy.diff_price_and_mean > strategy.stddev
            && (Math.abs(strategy.diff_price_and_mean) === strategy.diff_price_and_mean)
        ) {
            trending_up = true;
        } else if (
            strategy.diff_price_and_mean < strategy.stddev
            && (Math.abs(strategy.diff_price_and_mean) !== strategy.diff_price_and_mean)
        ) {
            trending_up = false; //literally: direction down
        }
    global.direc = trending_up
    }
    if (global.direc === false) {
      s.signal = 'sell'
    }
    else if (global.direc === true) {
      s.signal = 'buy'
    }
    cb()
  },
  onReport: function (s) {
    var cols = []
    cols.push(z(s.signal, ' ')[s.signal === false ? 'red' : 'green'])
    return cols
  },

  phenotypes: {
    // -- common
    // reference in extensions is given in ms have not heard of an exchange that supports 500ms thru api so setting min at 1 second
    period_length: Phenotypes.RangePeriod(1, 7200, 's'),
    min_periods: Phenotypes.Range(1, 2500),
    markdown_buy_pct: Phenotypes.RangeFloat(-1, 5),
    markup_sell_pct: Phenotypes.RangeFloat(-1, 5),
    order_type: Phenotypes.ListOption(['maker', 'taker']),
    sell_stop_pct: Phenotypes.Range0(1, 50),
    buy_stop_pct: Phenotypes.Range0(1, 50),
    profit_stop_enable_pct: Phenotypes.Range0(1, 20),
    profit_stop_pct: Phenotypes.Range(1,20),

    // -- strategy
    // trendtrades_1: Phenotypes.Range(2, 20),
    trendtrades: Phenotypes.Range(4, 10000)
  }
}

