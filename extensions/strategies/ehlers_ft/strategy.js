/*

Author: Travis

Adapted from: https://www.tradingview.com/script/Q0eQz7ll-Fisher-Transform-Indicator-by-Ehlers-Strategy/

Description: Market prices do not have a Gaussian probability density function 
as many traders think. Their probability curve is not bell-shaped. 
But trader can create a nearly Gaussian PDF for prices by normalizing 
them or creating a normalized indicator such as the relative strength 
index and applying the Fisher transform . Such a transformed output 
creates the peak swings as relatively rare events. 
Fisher transform formula is: y = 0.5 * ln ((1+x)/(1-x)) 
The sharp turning points of these peak swings clearly and unambiguously 
identify price reversals in a timely manner. 

Author Notes: 
pos = 1 indicates the fisher transform value for the period was ABOVE the previous period
pos = -1 indicates the fisher transform value for the period was BELOW the previous period
pos_length = 1 does default behavior from the original tradingview strategy.  
If pos_length > 1, make sure pos_length number of previous periods have opposite pos values. 

Sample sim command:
zenbot sim gdax.LTC-USD --strategy ehlers_ft --period_length 15m --days 3 --order_type maker --fish_pct_change 0 --length 10 --pos_length 1 --src HAohlc4 --min_periods 20 

If you have found this strategy useful and would like to show your appreciation, please consider donating 
ETH, BTC, or LTC to the developer, Travis.  
ETH: 0xdA963A127BeCB08227583d11f912F400D5347060 
BTC: 3KKHdBJpEGxghxGazoE4X7ihyr2q6nHUvW
LTC: MSePEwGJF8W4wvGCbJBqMtatwdBGYhT8FM

Please direct feedback concerning this strategy to the zenbot strategies discord channel @Travis: 
https://discordapp.com/channels/316120967200112642/383023593942155274

*/

const z = require('zero-fill'),
  n = require('numbro'),
  Phenotypes = require('../../../lib/phenotype'),
  tv = require('../../../lib/helpers')

module.exports = {
  name: 'ehlers_fisher_transform',
  description: '',

  getOptions: function() {
    this.option('period_length', 'period length, same as --period', String, '30m')
    this.option('fish_pct_change', 'percent change of fisher transform for reversal', Number, 0)
    this.option('length', 'number of past periods to use including current', Number, 10)
    this.option('src', 'use period.close if not defined. can be hl2, hlc3, ohlc4, HAhlc3, HAohlc4', String, 'hl2')
    this.option('pos_length', 'check this number of previous periods have opposing pos value', Number, 1)
  },

  calculate: function() {},

  onPeriod: function(s, cb) {
    // console.log('')
    if (!s.eft) {
      s.eft = {
        n1: [],
        fish: [],
        pos: [],
      }
      s.eft_max_elements = Math.max(s.options.pos_length, 3)
    }

    s.period.src = tv.src(s.options.src, s.period, s.lookback[0])

    let lbks = s.lookback.slice(0, s.options.length - 1).map(p => p.src),
      maxH = Math.max(s.period.src, ...lbks),
      minL = Math.min(s.period.src, ...lbks)

    s.eft.n1.unshift(0.33 * 2 * ((s.period.src - minL) / (maxH - minL) - 0.5) + 0.67 * tv.nz(s.eft.n1[0]))

    let n2 = tv.iff(s.eft.n1[0] > 0.99, 0.999, tv.iff(s.eft.n1[0] < -0.99, -0.999, s.eft.n1[0]))

    s.eft.fish.unshift(0.5 * Math.log((1 + n2) / (1 - n2)) + 0.5 * tv.nz(s.eft.fish[0]))

    s.eft.pos.unshift(
      tv.iff(s.eft.fish[0] > tv.nz(s.eft.fish[1] * (1 + s.options.fish_pct_change / 100)), 1,
        tv.iff(s.eft.fish[0] < tv.nz(s.eft.fish[1] * (1 - s.options.fish_pct_change / 100)), -1, tv.nz(s.eft.pos[0], 0))))

    if (!s.in_preroll) {
      if (s.options.pos_length === 1) {
        if (s.eft.pos[0] === 1) {
          s.signal = 'buy'
        } else if (s.eft.pos[0] === -1) {
          s.signal = 'sell'
        } else {
          s.signal = null
        }
      } else {

        let pos = s.eft.pos.slice(1, s.options.pos_length + 1),
          posUp = s.eft.pos[0] === -1 && pos.every(pos => pos === 1),
          posDn = s.eft.pos[0] === 1 && pos.every(pos => pos === -1)

        if (posUp) {
          s.signal = 'buy'
        } else if (posDn) {
          s.signal = 'sell'
        } else
          s.signal = null
      }
    }

    // cleanup
    if (s.eft.pos.length > s.eft_max_elements)
      Object.keys(s.eft).forEach(k => {
        s.eft[k].pop()
      })

    cb()
  },

  onReport: function(s) {
    var cols = []
    cols.push(z(10, 'F[' + n(s.eft.fish[0]).format('#.000') + ']', ''))
    cols.push(z(10, ' P[' + n(s.eft.pos[0]).format('##') + ']', ''))
    return cols
  },

  phenotypes: {

    //General Options
    period_length: Phenotypes.RangePeriod(5, 300, 'm'),
    min_periods: Phenotypes.Range(10, 40),
    markdown_buy_pct: Phenotypes.RangeFloat(0, 10),
    markup_sell_pct: Phenotypes.RangeFloat(0, 10),
    order_type: Phenotypes.ListOption(['maker', 'taker']),
    sell_stop_pct: Phenotypes.Range0(1, 50),
    buy_stop_pct: Phenotypes.Range0(1, 50),
    profit_stop_enable_pct: Phenotypes.Range(1, 20),
    profit_stop_pct: Phenotypes.Range(1, 10),

    //Strategy Specific
    length: Phenotypes.Range(1, 30),
    fish_pct_change: Phenotypes.Range(-25, 75),
    pos_length: Phenotypes.Range(1, 6),
    src: Phenotypes.ListOption(['close', 'hl2', 'hlc3', 'ohlc4', 'HAhlc3', 'HAohlc4'])
  }
}

/*

// Original pinescript
// From https://www.tradingview.com/script/Q0eQz7ll-Fisher-Transform-Indicator-by-Ehlers-Strategy/

study(title="Fisher Transform Indicator by Ehlers Strategy", shorttitle="Fisher Transform Indicator by Ehlers")
Length = input(10, minval=1)
xHL2 = hl2
xMaxH = highest(xHL2, Length)
xMinL = lowest(xHL2,Length)
nValue1 = 0.33 * 2 * ((xHL2 - xMinL) / (xMaxH - xMinL) - 0.5) + 0.67 * nz(nValue1[1])
nValue2 = iff(nValue1 > .99,  .999,
	        iff(nValue1 < -.99, -.999, nValue1))
nFish = 0.5 * log((1 + nValue2) / (1 - nValue2)) + 0.5 * nz(nFish[1])
pos =	iff(nFish > nz(nFish[1]), 1,
	    iff(nFish < nz(nFish[1]), -1, nz(pos[1], 0))) 
barcolor(pos == -1 ? red: pos == 1 ? green : blue )
plot(nFish, color=green, title="Fisher")
plot(nz(nFish[1]), color=red, title="Trigger")

*/