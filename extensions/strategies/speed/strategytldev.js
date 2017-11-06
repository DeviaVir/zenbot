var z = require('zero-fill')
var stats = require('stats-lite')
var n = require('numbro')




module.exports = function container (get, set, clear) {

  return {
    name: 'speed',
    description: 'Trade when % change from last two 1m periods is higher than average.',

    getOptions: function () {
      this.option('period', 'period length', String, '1s')
      this.option('min_periods', 'minimum lookback periods', Number, 2000)
      this.option('trendlines_length', 'Length of Trendlines', Number, 1000)
      this.option('trendlines_n', 'Number of trendlines', Number, 2)
      this.option('trend_1_buy_on_up', 'Buy on up?', String, 'true')
      this.option('trend_2_buy_on_up', 'Buy on up?', String, 'true')
      this.option('trend_1_trades_n', "Trades for trend 1", Number, 1000)
      this.option('trend_2_trades_n', "Trades for trend 2", Number, 100)
      this.option('selector', "Selector ie Gdax.BTC-USD", String, 'Gdax.BTC-USD')
    },


    calculate: function (s) {
        get('lib.ema')(s, 'speed', s.options.speed)
            if (s.lookback[s.options.trendlines_length]) {
                 for (let i=0; i < s.lookback.length; i++) {
                     s.trend_lines[i] = []
                     s.trend_lines[i].push(parseFloat(s.lookback[i].toString()));
                     while (s.trend_lines[i].length > s.options.trendlines_length + 1)
                         s.trend_lines[i].shift();
        }
    }
                trendlines_n = s.options.trendlines_n
                last_trade_price = s.trend_lines[0][s.trend_lines[0].length - 1]
                var is_trending_up = [];
                var should_buy = [];
                    for (let i=0; i < s.trend_lines.length; i++) {
                            let trend_line_id = i + 1;
                            var zz = s.options.trendlines_length
                            strategy[`trend_${trend_line_id}_buy_on_up`] = s.buy_on_up[i];
                            strategy[`trend_${trend_line_id}_trades_n`] = s.trend_lines[i].length - 1;
                            let real_prev_trend_line = s.trend_lines[i].slice(0);
                            real_prev_trend_line = real_prev_trend_line.slice(0, s.trend_lines[i].length - 1);
                            strategy[`trend_${trend_line_id}_prev_mean`] = stats.mean(real_prev_trend_line);
                            let real_trend_line = s.trend_lines[i].slice(0)
                            real_trend_line.shift();
                            strategy[`trend_${trend_line_id}_mean`] = stats.mean(real_trend_line);

                            let trending_up = strategy[`trend_${trend_line_id}_mean`] > strategy[`trend_${trend_line_id}_prev_mean`] ? tr$
                            strategy[`trend_${trend_line_id}_trending_up`] = trending_up;
                            is_trending_up.push(trending_up);
                            should_buy.push(`${s.options.selector}.strategies.TrendLines.trend_${trend_line_id}_buy_on_up` ? trending_up $
                    }
                    strategy.is_trending_up = is_trending_up.reduce((a, b) => { return a && b; });
                    strategy.should_buy = should_buy.reduce((a, b) => { return a && b; });
                    s.up = strategy.is_trending_up
                    s.buy = strategy.should_buy
                    console.log(s.up)
                    console.log(s.buy)
        }
    },

    onPeriod: function (s, cb) {
      if (s.buy === true) {
        s.signal = 'buy';
      }
      else if (s.buy === false) {
        s.signal = 'sell';
      }
     cb()
    },
    onReport: function (s) {
            var cols = []
            cols.push(z(s.buy, ' ')[s.buy = true ? 'green' : 'red'])
            cols.push(z(s.buy, ' ')[s.buy = false ? 'red' : 'green'])
            return cols
    },
  }
}
