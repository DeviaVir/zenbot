# How to create a strategy?

Are you sure?
At least you should have a minimum of code-writing skills...

**You can find help and very useful information here:**
https://www.reddit.com/r/zenbot/
https://discord.gg/z2VyhmxP8P

First of all, you are advised to read the base zenbot documentation, that can be found [here](https://github.com/DeviaVir/zenbot/tree/unstable/docs "here").

## # How Zenbot works with strategies?
Zenbot load a strategy by finding the file extensions/strategies/`<strategy-name>`/strategy.js

## # What to do?

### ## 1. Create a new strategy file
You should create a new folder inside strategies folder and name it whatever you want.
You also can create a copy of the ..\extensions\strategies\noop folder and rename it.
NOOP strategy is just an example of a strategy file.

You should have NOOP folder inside strategies folder but if you dont have it, you can download it here:
https://github.com/DeviaVir/zenbot/tree/unstable/extensions/strategies

This is what you probably will find inside the NOOP strategy file:

    module.exports = {
      name: 'noop',
      description: 'Just do nothing. Can be used to e.g. for training the strategy.',
      getOptions: function () {
        this.option('period', 'period length, same as --period_length', String, '30m')
        this.option('period_length', 'period length, same as --period', String, '30m')
     },
     calculate: function () {
     },
     onPeriod: function (s, cb) {
       cb()
     },
    onReport: function () { 
      var cols = []
      return cols
    }
    }

## # How strategy file is organized?
Zenbot strategy file is organized in 4 sections:
- getOptions
- calculate
- onPeriod
- onReport

## getOptions
Zenbot will search where the variables needed for your strategy.

    getOptions: function (s) {
    this.option('period', 'period length, same as --period_length', String, '5m')
    this.option('period_length', 'period length, same as --period', String, '5m')
    this.option('min_periods', 'min. number of history periods', Number, 200)
    // insert here the variables that your strategy will use. **
    }

## calculate
It's called each time there is a new trade. it's the right place to update indicators.

    // calculate MACD
    ema(s, 'ema_short', s.options.ema_short_period)
    ema(s, 'ema_long', s.options.ema_long_period)
    if (s.period.ema_short && s.period.ema_long) {
      s.period.macd = (s.period.ema_short - s.period.ema_long)
      ema(s, 'signal', s.options.signal_period, 'macd')
      if (s.period.signal) {
        s.period.macd_histogram = s.period.macd - s.period.signal
    }
    

Or if you simply want to use RSI indicator:

     // RSI indicator
     rsi(s, 'rsi', s.options.rsi_periods)


## onPeriod

It's called at the end of each period. It will be the right place to send 'buy' or 'sell' signals.

For example if you want to buy or sell based on RSI indicator:

    if (s.period.rsi < 30) { 
      s.signal = 'buy' 
    }

## onReport

called each time the console is refreshed. It must return an array, and each item in this array will be displayed in the console (after the RSI and before the balance).

Example:

      onReport: function (s) {
       var cols = []
       if (typeof s.period.rsi === 'number') {
         var color = 'grey'
         if (s.period.rsi <= s.options.oversold_rsi) {
           color = 'green'
         }
         if (s.period.rsi >= s.options.overbought_rsi) {
           color = 'red'
         }
         cols.push(z(4, n(s.period.rsi).format('0'), ' ')[color])
       }
       return cols 
       },
  


  
## # How can I look for past values?
## Lookback

Each time the period change, the current period is put at the beginning of `s.lookback` and `s.period` is reset. So you can check the last period in `s.lookback[0]`, the one before in `s.lookback[1]`, and so on.


### Thanks to:
- BAKfr
- TxTheNoob
