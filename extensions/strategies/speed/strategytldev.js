var z = require('zero-fill')
var stat = require('stats-lite')
var n = require('numbro')
module.exports = function container (get, set, clear) {
  return {
    name: 'stddev1',
    description: 'Trade when % change from last two 1m periods is higher than average.',

    getOptions: function () {
      this.option('period', 'period length', String, '1s')
      this.option('trendlines_length', 'Length of Trendlines', Number, 1000)
      this.option('trendlines_n', 'Number of trendlines', Number, 25)
    },

    calculate: function (s) {
      get('lib.ema')(s, 'speed', s.options.speed)
      if (s.lookback[s.options.trendlines_length]) {
        var trend_lines = []
        var i = s.trendlines_length
        while (--i)trend_lines.push(s.lookback[i].close);
	    let strategy = {
		    	trendlines_n: s.options.trendlines_n,
			    last_trade_price: this.trend_lines[0][this.trend_lines[0].length - 1]],
		    };
    		var is_trending_up = [];
	    	var should_buy = [];

		    for (let i=0; i < s.options.trendlines_n,; i++) {
			    let trend_line_id = i + 1;

			    strategy[`trend_${trend_line_id}_buy_on_up`] = this.buy_on_up[i];
			    strategy[`trend_${trend_line_id}_trades_n`] = this.trend_lines[i].length - 1;

			    let real_prev_trend_line = this.trend_lines[i].slice(0);
			    real_prev_trend_line = real_prev_trend_line.slice(0, this.trend_lines[i].length - 1);
			    strategy[`trend_${trend_line_id}_prev_mean`] = stats.mean(real_prev_trend_line);

			    let real_trend_line = this.trend_lines[i].slice(0);
			    real_trend_line.shift();
			    strategy[`trend_${trend_line_id}_mean`] = stats.mean(real_trend_line);

			    let trending_up = strategy[`trend_${trend_line_id}_mean`] > strategy[`trend_${trend_line_id}_prev_mean`] ? true : false;
			    strategy[`trend_${trend_line_id}_trending_up`] = trending_up;
			    is_trending_up.push(trending_up);

			    should_buy.push(settings.get(`${this.product_id}.strategies.TrendLines.trend_${trend_line_id}_buy_on_up`) ? trending_up : true);
		    }

		    strategy.is_trending_up = is_trending_up.reduce((a, b) => { return a && b; });
		    strategy.should_buy = should_buy.reduce((a, b) => { return a && b; });
        console.log(strategy.should_buy)
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
