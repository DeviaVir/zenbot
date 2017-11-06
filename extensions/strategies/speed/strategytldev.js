var z = require('zero-fill')
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
      this.option('trend_1_buy_on_up', 'Buy on up?', String, 'True')
      this.option('trend_2_buy_on_up', 'Buy on up?', String, 'True')
      this.option('trend_1_trades_n', "Trades for trend 1", Number, 1000)
      this.option('trend_2_trades_n', "Trades for trend 2", Number, 100)
      
    },

    calculate: function (s) {
      get('lib.ema')(s, 'speed', s.options.speed)
      if (s.lookback[s.options.trendlines_length]) {
            let strategy = {
                        trendlines_n: s.options.trendlines_n,
                        last_trade_price: s.lookback[0],
                    };
                var is_trending_up = [];
                var should_buy = [];
                    for (let i=0; i < s.options.trendlines_n; i++) {
                            let trend_line_id = i + 1;
                            let buy_on_up = [];
                            var trend_lines = []
                            var zz = s.options.trendlines_length
                            while (--zz) trend_lines.push(s.lookback[zz].close);
                            strategy[`trend_${trend_line_id}_buy_on_up`] = buy_on_up[i];
                            strategy[`trend_${trend_line_id}_trades_n`] = trend_lines[i] - 1;

                            let real_prev_trend_line = trend_lines.toString().slice(0);
                            real_prev_trend_line = real_prev_trend_line.slice(0, trend_lines[i] - 1);
                            strategy[`trend_${trend_line_id}_prev_mean`] = stats.mean(real_prev_trend_line);
                            let real_trend_line = [trend_lines.slice(0)];
                            real_trend_line.shift();
                            strategy[`trend_${trend_line_id}_mean`] = stats.mean(real_trend_line);

                            let trending_up = strategy[`trend_${trend_line_id}_mean`] > strategy[`trend_${trend_line_id}_prev_mean`] ? true : fals$
                            strategy[`trend_${trend_line_id}_trending_up`] = trending_up;
                            is_trending_up.push(trending_up);

                            should_buy.push('true');
                    }
                    strategy.is_trending_up = is_trending_up.reduce((a, b) => { return a && b; });
                    strategy.should_buy = should_buy.reduce((a, b) => { return a && b; });
                        console.log(strategy.should_buy)
                        console.log(strategy.is_trending_up)
                    if (strategy.should_buy === true
                        &&strategy.is_trending_up === true) {
                        s.signal = 'buy';
                    }
                    else {
                        s.signal = 'sell';
                    }
                    return strategy;
            }
    },
    onPeriod: function (s, cb) {
      cb()
    },

    onReport: function (s) {
      var cols = []
      cols.push(z(8, TEST, ' ')[s.diffpm > 0 ? 'green' : 'red'])
      cols.push(z(8, TEST, ' ')[s.diffpm < 0 ? 'red' : 'green'])
      return cols
    },
  }
}
