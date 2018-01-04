var z = require('zero-fill')
  , n = require('numbro')
;


var data = "";
module.exports = function container (get, set, clear) {
  return {
    name: 'crossover_vwap',
    description: 'Estimate trends by comparing "Volume Weighted Average Price" to the "Exponential Moving Average".',

    getOptions: function () {      
      // default start is 30, 108, 60.
      // these are relative to period length.
      
      /*
        Positive simulations during testing: 
      
        zenbot sim kraken.XXRP-ZEUR --period="120m" --strategy=crossover_vwap --currency_capital=700 --asset_capital=0 --max_slippage_pct=100 --days=60 --avg_slippage_pct=0.045 --vwap_max=8000 --markup_sell_pct=0.5 --markdown_buy_pct=0.5 --emalen1=50
        zenbot sim kraken.XXRP-ZEUR --period="120m" --strategy=crossover_vwap --currency_capital=700 --asset_capital=0 --max_slippage_pct=100 --days=60 --avg_slippage_pct=0.045 --vwap_max=8000 --markup_sell_pct=0.5 --markdown_buy_pct=0.5 --emalen1=30
      */
      this.option('period', 'period length, same as --period_length', String, '120m')
      this.option('period_length', 'period length, same as --period', String, '120m')
      this.option('emalen1', 'Length of EMA 1', Number, 30 )//green
      this.option('smalen1', 'Length of SMA 1', Number, 108 )//red
      this.option('smalen2', 'Length of SMA 2', Number, 60 )//purple
      this.option('vwap_length', 'Min periods for vwap to start', Number, 10 )//gold
      this.option('vwap_max', 'Max history for vwap. Increasing this makes it more sensitive to short-term changes', Number, 8000)//gold
    },
    

    calculate: function (s) {
        get('lib.vwap')(s, 'vwap', s.options.vwap_length, s.options.vwap_max)//gold
        
        get('lib.ema')(s, 'ema1', s.options.emalen1)//green
        get('lib.sma')(s, 'sma1', s.options.smalen1, 'high')//red
        get('lib.sma')(s, 'sma2', s.options.smalen2)//purple
    },
    
    onPeriod: function (s, cb) { 
      let pOpen = s.period.open,
        pClose = s.period.close,
        emagreen = s.period.ema1,
        smared = s.period.sma1,
        smapurple= s.period.sma2,
        vwapgold = s.period.vwap;
    
     // helper functions
     var trendUp = function(s, cancel){
        if (s.trend !== 'up') {
          s.acted_on_trend = false
        }
        s.trend = 'up'
        s.signal = !s.acted_on_trend ? 'buy' : null
        s.cancel_down = false

        if(cancel)
          s.cancel_down = true
      },
      trendDown = function(s){
        if (s.trend !== 'down') {
          s.acted_on_trend = false
        }
        s.trend = 'down'
        s.signal = !s.acted_on_trend ? 'sell' : null
      };
      
      if(emagreen && smared && smapurple && s.period.vwap){
        
        if(vwapgold > emagreen) trendUp(s, true)
        else trendDown(s)
          
      }
      cb()
    },

    onReport: function (s) {
      var cols = []
      let pOpen = s.period.open,
        pClose = s.period.close,
        emagreen = s.period.ema1,
        smared = s.period.sma1,
        smapurple= s.period.sma2,
        vwapgold = s.period.vwap
      
      if (vwapgold && emagreen) {   
        var color = "green";
        if(vwapgold > emagreen) color = "red"
          
        cols.push(z(6, n(vwapgold).format('0.00000'), '')['yellow'] + ' ')
        cols.push(z(6, n(emagreen).format('0.00000'), '')[color] + ' ')
      }
      else {
        cols.push('                ')
      }
      return cols
    }
  }
}
