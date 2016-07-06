# zenbot

Follow zenbot [on Twitter!](https://twitter.com/zenbot_btc)

![zenbot logo](https://raw.githubusercontent.com/carlos8f/zenbot/master/assets/zenbot_square.png)

> “To follow the path, look to the master, follow the master, walk with the master, see through the master, become the master.”
> – Zen Proverb

zenbot is an automated Bitcoin trading bot for [GDAX](https://gdax.com/).

zenbot follows a couple human-made rules:

1. decisions based on net trade volume of the dominant "taker" side
2. trade only at market value

The rest of the trading strategy is based on machine-learning and historical analysis, which you can run yourself to discover better strategies. It has full console graphing/indicators to show its reasoning when making decisions.

Since zenbot discovers its own best parameters based on marked data, you don't have to be a savvy trader to use it.

- Out of the box, zenbot is an AI-powered trade advisor (gives you buy or sell signals while watching live data)
- Give it a virtual balance, and zenbot will simulate on historical data and give you an ROI figure.
- Give it some time, and zenbot will learn how to improve the ROI through tweaking the trade parameters.
- Give it an API key, and zenbot will actually perform trades!

HOWEVER. BE AWARE that once you hook up zenbot to a live exchange, the damage done is your fault, not mine!

## Install

Prereqs: [nodejs](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/)

```
$ git clone git@github.com:carlos8f/zenbot.git && cd zenbot
$ npm install && npm link
$ cp config-sample.js config.js
$ (edit config.js with api key)
$ zenbot

  Usage: zenbot [options] [command]


  Commands:

    record [options]     1. run the recorder
    backfill [options]   2. run the backfiller
    learn [options]      3. run the machine learner
    mem                  (optional) show zenbot's memory
    forget               (optional) forget machine learning
    sim [options]        (optional) run the simulator
    run [options]        4. run zenbot on the exchange
    *

  Options:

    -h, --help     output usage information
    --silent       speak no evil
    -V, --version  output the version number

```

## Screenshot

![screenshot](https://cloud.githubusercontent.com/assets/106763/16441892/e791744c-3d82-11e6-834e-b566d498e7e9.png)

## Common commands

### record trades

Use the `--tweet` flag to live tweet big buys/sells.

```
$ zenbot record
7/5/2016, 8:10:46 PM PDT  trades: SELL $678.57/0.172
7/5/2016, 8:10:46 PM PDT  trades:  BUY $678.65/0.858
7/5/2016, 8:10:46 PM PDT saw 10 trades.
7/5/2016, 8:11:06 PM PDT  trades:  BUY $678.73/0.030
7/5/2016, 8:11:06 PM PDT  trades:  BUY $678.76/0.030
7/5/2016, 8:11:06 PM PDT saw 3 trades.
7/5/2016, 8:11:26 PM PDT  trades:  BUY $678.93/2.451
7/5/2016, 8:11:26 PM PDT  trades:  BUY $679.00/3.621
7/5/2016, 8:11:26 PM PDT saw 10 trades.
7/5/2016, 8:11:46 PM PDT  trades:  BUY $678.99/2.115
7/5/2016, 8:11:46 PM PDT  trades: SELL $678.95/0.034
7/5/2016, 8:11:46 PM PDT saw 2 trades.
```

### backfill trades

```
$ zenbot backfill
```

### run trade simulation on backfilled/recorded data

```
$ zenbot sim
7/5/2016, 3:11:32 PM PDT motley: boot
7/5/2016, 3:11:32 PM PDT motley-mongo: connecting...
7/5/2016, 3:11:32 PM PDT motley-mongo: connected to mongodb://localhost:27017/zenbot
7/5/2016, 3:11:32 PM PDT motley: boot complete.
7/5/2016, 3:11:32 PM PDT motley: mount
7/5/2016, 3:11:32 PM PDT motley: mount complete.
7/5/2016, 3:11:32 PM PDT zenbot/2.2.0 booting!
7/5/2016, 3:11:32 PM PDT [zen] i have improved the strategy 0.000% over the defaults!
7/5/2016, 3:11:32 PM PDT [param] min_vol = 193.9208826004112
7/5/2016, 3:11:32 PM PDT [param] trade_amt = 0.45509571178036573
7/5/2016, 3:11:32 PM PDT [param] min_trade = 0.015183722207531974
7/5/2016, 3:11:32 PM PDT [param] cooldown = 2.955756963428735
7/5/2016, 3:11:32 PM PDT [param] crash = 9.517183280985977
7/5/2016, 3:11:32 PM PDT [param] sell_for_less = 5.278984337535669
7/5/2016, 3:11:32 PM PDT [param] buy_for_more = 8.426473512390354
7/5/2016, 3:11:32 PM PDT [param] vol_reset = 2879.719145224794
7/5/2016, 3:11:32 PM PDT [sim] start = 4/6/2016, 05:00:00 PM PDT, end = 6/29/2016, 05:00:00 PM PDT
7/5/2016, 3:11:33 PM PDT           ++++++++++ $421.86   67 BULL 4/6/2016, 05:55:00 PM PDT 0.000 BTC-USD $1,000.00 +$0.00 0.000
7/5/2016, 3:11:33 PM PDT        ---           $421.61   26 BULL 4/6/2016, 06:48:30 PM PDT 0.000 BTC-USD $1,000.00 +$0.00 0.000
7/5/2016, 3:11:33 PM PDT          -           $421.71  134 BULL 4/6/2016, 07:43:00 PM PDT 0.000 BTC-USD $1,000.00 +$0.00 0.000
7/5/2016, 3:11:33 PM PDT           ++++++++++ $422.15  162 BULL 4/6/2016, 08:46:00 PM PDT 0.000 BTC-USD $1,000.00 +$0.00 0.000
7/5/2016, 3:11:33 PM PDT ----------           $419.79   72 BULL 4/6/2016, 09:17:50 PM PDT 0.000 BTC-USD $1,000.00 +$0.00 0.000
7/5/2016, 3:11:33 PM PDT     ------           $420.28  114 BULL 4/6/2016, 10:20:50 PM PDT 0.000 BTC-USD $1,000.00 +$0.00 0.000
7/5/2016, 3:11:33 PM PDT         --           $421.00  156 BULL 4/6/2016, 11:26:00 PM PDT 0.000 BTC-USD $1,000.00 +$0.00 0.000
7/5/2016, 3:11:33 PM PDT [bot] volume trigger BUY 196.4 >= 193.9
7/5/2016, 3:11:33 PM PDT [bot] BUY 1.080 BTC at $421.36 -0.031%
7/5/2016, 3:11:33 PM PDT           +          $421.44    7 BULL 4/7/2016, 12:29:00 AM PDT 1.080 BTC-USD $543.77 -$1.05 1.080
7/5/2016, 3:11:33 PM PDT                      $421.32   64 BULL 4/7/2016, 01:09:00 AM PDT 1.080 BTC-USD $543.77 -$1.18 1.080
7/5/2016, 3:11:33 PM PDT           +          $421.53  106 BULL 4/7/2016, 02:00:40 AM PDT 1.080 BTC-USD $543.77 -$0.95 1.080
7/5/2016, 3:11:33 PM PDT           ++         $421.73  127 BULL 4/7/2016, 02:57:20 AM PDT 1.080 BTC-USD $543.77 -$0.73 1.080
7/5/2016, 3:11:33 PM PDT                      $421.35   94 BULL 4/7/2016, 04:15:30 AM PDT 1.080 BTC-USD $543.77 -$1.14 1.080
7/5/2016, 3:11:33 PM PDT      -----           $420.45   85 BULL 4/7/2016, 05:12:00 AM PDT 1.080 BTC-USD $543.77 -$2.12 1.080
7/5/2016, 3:11:33 PM PDT                      $421.26  151 BULL 4/7/2016, 05:58:30 AM PDT 1.080 BTC-USD $543.77 -$1.24 1.080
7/5/2016, 3:11:33 PM PDT          -           $421.04  177 BULL 4/7/2016, 06:49:00 AM PDT 1.080 BTC-USD $543.77 -$1.48 1.080
7/5/2016, 3:11:33 PM PDT          -           $421.05  174 BULL 4/7/2016, 07:40:00 AM PDT 1.080 BTC-USD $543.77 -$1.47 1.080
7/5/2016, 3:11:33 PM PDT          -           $421.00  175 BULL 4/7/2016, 08:24:40 AM PDT 1.080 BTC-USD $543.77 -$1.52 1.080
7/5/2016, 3:11:33 PM PDT [bot] volume trigger BUY 198.4 >= 193.9
7/5/2016, 3:11:33 PM PDT [bot] BUY 0.704 BTC at $421.17 0.000%
7/5/2016, 3:11:33 PM PDT           ++         $421.65   23 BULL 4/7/2016, 09:11:30 AM PDT 1.784 BTC-USD $246.73 -$1.22 1.784
7/5/2016, 3:11:33 PM PDT           +++++      $422.17  106 BULL 4/7/2016, 09:55:30 AM PDT 1.784 BTC-USD $246.73 -$0.29 1.784
7/5/2016, 3:11:33 PM PDT           +++++++    $422.53  171 BULL 4/7/2016, 10:41:00 AM PDT 1.784 BTC-USD $246.73 +$0.35 1.784
7/5/2016, 3:11:33 PM PDT           +++++      $422.17  138 BULL 4/7/2016, 11:26:00 AM PDT 1.784 BTC-USD $246.73 -$0.29 1.784
```

### run the machine learner

```
$ zenbot learn [--concurrency <threads>] [--throttle <load>]
7/5/2016, 3:11:36 PM PDT motley: boot
7/5/2016, 3:11:36 PM PDT motley-mongo: connecting...
7/5/2016, 3:11:37 PM PDT motley-mongo: connected to mongodb://localhost:27017/zenbot
7/5/2016, 3:11:37 PM PDT motley: boot complete.
7/5/2016, 3:11:37 PM PDT motley: mount
7/5/2016, 3:11:37 PM PDT motley: mount complete.
7/5/2016, 3:11:37 PM PDT zenbot/2.2.0 booting!
7/5/2016, 3:11:37 PM PDT [zen] i have improved the strategy 0.000% over the defaults!
7/5/2016, 3:11:37 PM PDT [param] min_vol = 193.9208826004112
7/5/2016, 3:11:37 PM PDT [param] trade_amt = 0.45509571178036573
7/5/2016, 3:11:37 PM PDT [param] min_trade = 0.015183722207531974
7/5/2016, 3:11:37 PM PDT [param] cooldown = 2.955756963428735
7/5/2016, 3:11:37 PM PDT [param] crash = 9.517183280985977
7/5/2016, 3:11:37 PM PDT [param] sell_for_less = 5.278984337535669
7/5/2016, 3:11:37 PM PDT [param] buy_for_more = 8.426473512390354
7/5/2016, 3:11:37 PM PDT [param] vol_reset = 2879.719145224794
7/5/2016, 3:11:37 PM PDT running first simulation...
7/5/2016, 3:11:59 PM PDT ended simulation with $1,608.16 USDULL 6/29/2016, 04:59:30 PM PDT 2.497 BTC-USD $11.46 +$608.16 30.164841

7/5/2016, 3:12:00 PM PDT [ding!] undefined = 0.000 -> 0.000, fitness 1.608 -> 1.608, num_trades = 101, vol = 30.164


  simulating [============================================================] 100% 0.3s min_trade = 0.015 -> 0.025, best_roi = +1.608
  simulating [=========================================================   ] 96% 3.1s min_vol = 193.921 -> 252.850, best_roi = +1.608
  simulating [========================================================    ] 94% 4.7s min_vol = 193.921 -> 324.045, best_roi = +1.608

7/5/2016, 3:13:10 PM PDT [died] min_trade = 0.015 -> 0.025, fitness 1.578, num_trades = 98, vol = 30.077

  simulating [=========================================================   ] 95% 3.3s min_vol = 193.921 -> 324.045, best_roi = +1.608
  simulating [=========================================================== ] 98% 1.2s vol_reset = 2879.719 -> 3012.871, best_roi = +1.608
  simulating [============================================================] 100% 0.0s vol_reset = 2879.719 -> 2442.981, best_roi = +1.608
  simulating [=====================================================       ] 88% 6.6s vol_reset = 2879.719 -> 4011.342, best_roi = +1.608

7/5/2016, 3:14:01 PM PDT [died] vol_reset = 2879.719 -> 3012.871, fitness 1.235, num_trades = 85, vol = 24.823
```

## view zenbot's memory

```
$ zenbot mem
{
  "rs": {
    "id": "BTC-USD",
    "asset": 0.46525203,
    "currency": 31.1269924096975,
    "side": "BUY",
    "period_vol": 0,
    "running_vol": 3161.5788801299973,
    "running_total": 2125088.2785721975,
    "high": 0,
    "low": 10000,
    "vol": 40.36600738999999,
    "max_diff": 13.844102780236,
    "buy_price": 672.36805,
    "sell_price": null,
    "trade_vol": 0.2983288741988967,
    "cooldown": 3,
    "last_tick": {
      "id": "10s146777472",
      "time": 1467774720000,
      "vol": 0.99236,
      "high": 679,
      "low": 679,
      "open": 679,
      "close": 679,
      "trades": 1,
      "buys": 1,
      "buy_vol": 0.99236,
      "buy_ratio": 1,
      "typical": 679,
      "price": "$679.00",
      "side": "BUY",
      "ticker": " BUY $679.00/0.992",
      "trade_ticker": " trades: \u001b[37m BUY $679.00/0.992\u001b[39m"
    },
    "vol_diff_string": "\u001b[37m  40\u001b[39m \u001b[32mBULL\u001b[39m",
    "last_hour": "h407715",
    "hour_vol": 29.758250760000003,
    "first_tick": {
      "id": "10s146759181",
      "time": 1467591810000,
      "vol": 0.99594,
      "high": 661.97,
      "low": 661.97,
      "open": 661.97,
      "close": 661.97,
      "trades": 1,
      "buys": 0,
      "buy_vol": 0,
      "buy_ratio": 0,
      "typical": 661.97,
      "price": "$661.97",
      "side": "SELL",
      "ticker": "SELL $661.97/0.996",
      "trade_ticker": " trades: \u001b[37mSELL $661.97/0.996\u001b[39m"
    },
    "num_trades": 3,
    "volatility": 4.861625649210798
  },
  "learned": {
    "id": "learned",
    "fitness_diff": 0,
    "start_fitness": 1.6081586560778007,
    "best_fitness": 1.6081586560778007,
    "roi": 1.6081586560778007,
    "trade_vol": 30.163956150906117,
    "best_params": {
      "min_vol": 193.9208826004112,
      "trade_amt": 0.45509571178036573,
      "min_trade": 0.015183722207531974,
      "cooldown": 2.9820496114286525,
      "crash": 9.327760400611698,
      "sell_for_less": 8.041059546233535,
      "buy_for_more": 9.823796988246029,
      "vol_reset": 2879.719145224794
    },
    "iterations": 1,
    "simulations": 21,
    "mutations": 3,
    "total_duration": 12127.211000000003,
    "last_duration": "11 minutes",
    "last_speed": "0.093/min",
    "direction": "pos",
    "best_param": null,
    "best_param_direction": null,
    "num_trades": 101,
    "total_duration_str": "3 hours"
  }
}
```

### run trade bot on the exchange

Use the `--trade` flag to enable real trading (zen mode).

Use the `--tweet` flag to live tweet buys/sells and hourly status report.

```
$ zenbot run --trade --tweet
7/5/2016, 5:54:22 PM PDT motley: boot
7/5/2016, 5:54:23 PM PDT motley-mongo: connecting...
7/5/2016, 5:54:23 PM PDT motley-mongo: connected to mongodb://localhost:27017/zenbot
7/5/2016, 5:54:23 PM PDT motley: boot complete.
7/5/2016, 5:54:24 PM PDT motley: mount
7/5/2016, 5:54:24 PM PDT motley: mount complete.
7/5/2016, 5:54:24 PM PDT zenbot/2.2.0 booting!
7/5/2016, 5:54:24 PM PDT [zen] i have improved the strategy 0.000% over the defaults!
7/5/2016, 5:54:24 PM PDT [param] min_vol = 193.9208826004112
7/5/2016, 5:54:24 PM PDT [param] trade_amt = 0.45509571178036573
7/5/2016, 5:54:24 PM PDT [param] min_trade = 0.015169378623383137
7/5/2016, 5:54:24 PM PDT [param] cooldown = 2.6620246551250526
7/5/2016, 5:54:24 PM PDT [param] crash = 9.594941531196158
7/5/2016, 5:54:24 PM PDT [param] sell_for_less = 8.609007553577678
7/5/2016, 5:54:24 PM PDT [param] buy_for_more = 8.899812403970785
7/5/2016, 5:54:24 PM PDT [param] vol_reset = 2879.719145224794
7/5/2016, 5:54:24 PM PDT entering zen mode...
7/5/2016, 5:54:25 PM PDT [btcvol.info] volatility 0 -> 4.834744439517965
7/5/2016, 5:54:26 PM PDT memory loaded. resuming trading!
7/5/2016, 5:54:26 PM PDT [exchange] bid = 669.99, ask = 670
7/5/2016, 5:54:55 PM PDT          -           $670.00   78 BULL 0.426 BTC-USD $57.43 +$0.00 0.259
7/5/2016, 5:55:25 PM PDT          -           $669.99   73 BULL 0.426 BTC-USD $57.43 +$0.00 0.259
7/5/2016, 5:56:06 PM PDT          -           $670.00   73 BULL 0.426 BTC-USD $57.43 +$0.00 0.259
7/5/2016, 5:56:16 PM PDT          -           $670.00   73 BULL 0.426 BTC-USD $57.43 +$0.00 0.259
7/5/2016, 5:56:26 PM PDT          -           $669.99   72 BULL 0.426 BTC-USD $57.43 +$0.00 0.259
7/5/2016, 5:56:57 PM PDT          -           $670.00   72 BULL 0.426 BTC-USD $57.43 +$0.00 0.259
7/5/2016, 5:57:27 PM PDT          -           $669.99   69 BULL 0.426 BTC-USD $57.43 +$0.00 0.259
7/5/2016, 5:57:58 PM PDT          -           $670.00   80 BULL 0.426 BTC-USD $57.43 +$0.00 0.259
7/5/2016, 5:58:18 PM PDT          -           $670.00   80 BULL 0.426 BTC-USD $57.43 +$0.00 0.259
7/5/2016, 5:58:48 PM PDT          -           $670.00   81 BULL 0.426 BTC-USD $57.43 +$0.00 0.259
7/5/2016, 5:59:18 PM PDT          -           $669.75   78 BULL 0.426 BTC-USD $57.43 -$0.10 0.259
7/5/2016, 5:59:48 PM PDT          -           $669.74   79 BULL 0.426 BTC-USD $57.43 -$0.11 0.259
7/5/2016, 6:00:18 PM PDT          -           $669.59   80 BULL 0.426 BTC-USD $57.43 -$0.17 0.259
7/5/2016, 6:00:19 PM PDT tweeted: 6pm PDT report.

close: $669.59
vs. vwap: -$1.88
hr. volume: 203
market: BULL
24hr. diff: -$12.18

#btc #gdax
7/5/2016, 6:00:48 PM PDT          -           $669.58   80 BULL 0.426 BTC-USD $57.43 -$0.17 0.259
7/5/2016, 6:01:18 PM PDT          -           $669.83   83 BULL 0.426 BTC-USD $57.43 -$0.07 0.259
```

### forget machine learning and trader run-state

```
$ zenbot forget [--learned] [--rs]
```

- - -

### License: MIT

- Copyright (C) 2016 Carlos Rodriguez (http://s8f.org/)
- Copyright (C) 2016 Terra Eclipse, Inc. (http://www.terraeclipse.com/)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished
to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

