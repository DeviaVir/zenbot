z = require('zero-fill')
var stats = require('stats-lite')
var n = require('numbro')
var TEST = [0]
module.exports = function container (get, set, clear) {
  return {
    name: 'speed',
    description: 'Trade when % change from last two 1m periods is higher than average.',

    getOptions: function () {
      this.option('period', 'period length', String, '1s')
      this.option('trendlines_length', 'Length of Trendlines', Number, 1000)
      this.option('trendlines_n', 'Number of trendlines', Number, 2)
      this.option('trend_1_buy_on_up', 'Buy on up?', String, 'true')
      this.option('trend_2_buy_on_up', 'Buy on up?', String, 'true')
      this.option('trend_1_trades_n', "Trades for trend 1", Number, 1000)
      this.option('trend_2_trades_n', "Trades for trend 2", Number, 100)
      this.option('selector', "Selector", String, 'Gdax.BTC-USD')
      
    },

    calculate: function (s) {
      get('lib.ema')(s, 'speed', s.options.speed)
      trend_lines = [];
      buy_on_up = [];
      trendlines_length = s.options.trendlines_length;
      trades_n = s.options.trendlines_length;
      if (s.lookback[s.options.trendlines_length]) {
          var trend_lines = []
          var trend_linesp = []
          var i = s.options.trendlines_length - 1
          var x = s.options.trendlines_length
          while (--x)trend_lines.push(s.lookback[x].close);
          while (--i)trend_linesp.push(s.lookback[i].close)
 
            let strategy = {
                        trendlines_n: s.options.trendlines_n,
                        last_trade_price: s.lookback[1].close[s.lookback[0].length -1],
                };
                for (let i=0; i < trend_lines.length; i++) {
                    var is_trending_up = [];
                    var should_buy = [];
                    let trend_line_id = i + 1;
                    strategy[`trend_${trend_line_id}_buy_on_up`] = buy_on_up[i];
                    strategy[`trend_${trend_line_id}_trades_n`] = trend_lines.length - 1;
                    let real_prev_trend_line = trend_linesp;
                    strategy[`trend_${trend_line_id}_prev_mean`] = stats.mean(real_prev_trend_line);
                    let real_trend_line = trend_lines;
                    strategy[`trend_${trend_line_id}_mean`] = stats.mean(real_trend_line);
                    let trending_up = strategy[`trend_${trend_line_id}_mean`] > strategy[`trend_${trend_line_id}_prev_mean`] ? true : false;
                    strategy[`trend_${trend_line_id}_trending_up`] = trending_up;
                    is_trending_up.push(trending_up);
                    should_buy.push(`${s.options.selector}.strategies.TrendLines.trend_${trend_line_id}_buy_on_up` ? trending_up : true);
                    }
                    strategy.is_trending_up = is_trending_up.reduce((a, b) => { return a && b; });
                    strategy.should_buy = should_buy.reduce((a, b) => { return a && b; });
                    s.command = strategy.should_buy
                    return strategy;
        }
    },
    onPeriod: function (s, cb) {
      if (s.command === true) {
      s.signal = 'buy'
      }
      else if (s.command === false) {
      s.signal = 'sell'
      }
      cb()
    },

    onReport: function (s) {
      var cols = []
      cols.push(z(s.signal, ' ')[s.signal === true ? 'green' : 'red'])
      cols.push(z(s.signal, ' ')[s.signal === false ? 'red' : 'green'])
            return cols
      },
    }
  }
      
