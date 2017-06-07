![zenbot logo](https://rawgit.com/carlos8f/zenbot/master/assets/logo.png)

> “To follow the path, look to the master, follow the master, walk with the master, see through the master, become the master.”
> – Zen Proverb

## New! Chat with other Zenbot users

[![zenbot logo](https://rawgit.com/carlos8f/zenbot/master/assets/discord.png)](https://discord.gg/ZdAd2gP)

Zenbot has a Discord chat again! You can get in [through this invite link](https://discord.gg/ZdAd2gP).

## Known Issues and current status

Currently (11 days after being released), Zenbot 4 is functional, but is having trouble reliably making profit. At this point, **I would recommend against trading with large amounts** until some of these issues can be worked out:

- Many people are reporting [losses in live trading](https://github.com/carlos8f/zenbot/issues/189) even if the simulation results and/or paper trading is positive.
- This is my highest priority right now, since an unprofitable bot is not worth much, but please understand that reliably making profit is hard, and so is making a realistic simulator.
- The losses may be due to the default strategy not working well in sideways (non-trending) market conditions, slippage during limit order execution, or both. Currently I would recommend against using Zenbot on a market that is non-trending or trending generally downwards.
- The limit-order strategy that Zenbot uses to avoid taker fees, is prone to race conditions and delays. A mode for using market-type orders will probably need to be made, which may make frequent-trade strategies less viable due to fees, but more reliable execution overall.
- An upcoming feature will allow Zenbot to use a limited amount of your balance, which will help with experimenting with live trading, but mitigating the possible losses from the issues above.

Zenbot is a hobby project for me and I'm sorry that I can't devote myself full-time to it. Since I'm getting busier, development may slow down a bit from here, so please be patient if issues aren't fixed right away.

## Description

Zenbot is a command-line cryptocurrency trading bot using Node.js and MongoDB. It features:

- Fully-automated [technical-analysis](http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:introduction_to_technical_indicators_and_oscillators)-based trading approach
- Full support for [GDAX](https://gdax.com/), [Poloniex](https://poloniex.com) and [Kraken](https://kraken.com/), work on further exchange support is ongoing.
- Plugin architecture for implementing exchange support, or writing new strategies
- Simulator for [Backtesting strategies](https://gist.github.com/carlos8f/b09a734cf626ffb9bb3bcb1ca35f3db4) against historical data
- "Paper" trading mode, operates on a simulated balance while watching the live market
- Configurable sell stops, buy stops, and (trailing) profit stops
- Flexible sampling period and trade frequency - averages 1-2 trades/day with 1h period, 10/day with 15m period

## Disclaimer

- Zenbot is NOT a sure-fire profit machine. Use it AT YOUR OWN RISK.
- Crypto-currency is still an experiment, and therefore so is Zenbot. Meaning, both may fail at any time.
- Running a bot, and trading in general requires careful study of the risks and parameters involved. A wrong setting can cause you a major loss.
- Never leave the bot un-monitored for long periods of time. Zenbot doesn't know when to stop, so be prepared to stop it if too much loss occurs.
- Often times the default trade parameters will underperform vs. a buy-hold strategy, so run some simulations and find the optimal parameters for your chosen exchange/pair before going "all-in".

## Quick-start

### 1. Requirements: Linux or OSX or Docker, [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/).

### 2. Install zenbot 4:

Run in your console,

```
git clone https://github.com/carlos8f/zenbot.git
```

Or, without git,

```
wget https://github.com/carlos8f/zenbot/archive/master.tar.gz
tar -xf zenbot-master.tar.gz
mv zenbot-master zenbot
```

Create your configuration file by copying `conf-sample.js` to `conf.js`:

```
cp conf-sample.js conf.js
```

- View and edit `conf.js`.
- It's possible to use zenbot in "paper trading" mode without making any changes.
- You must add your exchange API keys to enable real trading however.
- API keys do NOT need deposit/withdrawl permissions.

If using Docker, skip to section "Docker" below.

Install dependencies:

```
cd zenbot
npm install
# optional, installs the `zenbot.sh` binary in /usr/local/bin:
npm link
```

### Docker

To run Zenbot under Docker, install Docker, Docker Compose, Docker Machine (if necessary) You can follow instructions at https://docs.docker.com/compose/install/

After installing (step 2 above),

```
cd zenbot
docker-compose build
docker-compose up (-d if you don't want to see the log)
```

If you wish to run commands (e.g. backfills, list-selectors), you can run this separate command after a successful `docker-compose up -d`:

```
docker run --rm --link zenbot_mongodb_1:mongodb -it zenbot_server ./zenbot.sh list-selectors
docker run --rm --link zenbot_mongodb_1:mongodb -it zenbot_server ./zenbot.sh backfill <selector> --days <days>
```

### Vocab: selectors

A "selector" is a short identifier that tells Zenbot which exchange and currency pair to act on. Use the form `{exchange_slug}.{asset}-{currency}`. A complete list of selectors your Zenbot install supports can be found with:

```
zenbot list-selectors

gdax:
  gdax.BTC-EUR   (BTC/EUR)
  gdax.BTC-GBP   (BTC/GBP)
  gdax.BTC-USD   (BTC/USD)
  gdax.ETH-BTC   (ETH/BTC)
  gdax.ETH-USD   (ETH/USD)
  gdax.LTC-BTC   (LTC/BTC)
  gdax.LTC-USD   (LTC/USD)

poloniex:
  poloniex.AMP-BTC   (Synereo AMP/BTC)
  poloniex.ARDR-BTC   (Ardor/BTC)
  poloniex.BCN-BTC   (Bytecoin/BTC)
  poloniex.BCN-XMR   (Bytecoin/XMR)
  poloniex.BCY-BTC   (BitCrystals/BTC)

...etc
```

### 3. (optional) Run simulations for your chosen selector

To backfill data (provided that your chosen exchange supports it), use:

```
zenbot backfill <selector> --days <days>
```

After you've backfilled, you can run a simulation:

```
zenbot sim <selector> [options]
```

For a list of options for the `sim` command, use:

```
zenbot sim --help

```

For additional options related to the strategy, use:

```
zenbot list-strategies
```

- By default the sim will start with 1000 units of currency. Override with `--currency_capital` and `--asset_capital`.
- Open `sim_result.html` in your browser to see a candlestick graph with trades.

#### Screenshot and example result

Zenbot outputs an HTML graph of each simulation result. In the screenshot below, the pink arrows represent the bot buying (up arrow) and selling (down arrow) as it iterated the historical data of [GDAX](https://gdax.com/) exchange's BTC/USD product.

![screenshot](https://cloud.githubusercontent.com/assets/106763/25983930/7e5f9436-369c-11e7-971b-ba2916442eea.png)

```
end balance 2954.50 (195.45%)
buy hold 1834.44 (83.44%)
vs. buy hold 61.06%
110 trades over 91 days (avg 1.21 trades/day)
```

Zenbot started with $1,000 USD and ended with $2,954.50 after 90 days, making 195% ROI! In spite of a buy/hold strategy returning a respectable 83.44%, Zenbot has considerable potential for beating buy/holders.

- Note that this example used tweaked settings to achieve optimal return: `--enable_profit_stop_pct=10`, `--profit_stop_pct=4`, `trend_ema=36`, and `--sell_rate=-0.006`. Default parameters yielded around 65% ROI.
- [Raw data](https://gist.github.com/carlos8f/b09a734cf626ffb9bb3bcb1ca35f3db4) from simulation

### 4. Run zenbot

The following command will launch the bot, and if you haven't touched `c.default_selector` in `conf.js`, will trade the default BTC/USD pair on GDAX.

```
zenbot trade [--paper]
```

Use the `--paper` flag to only perform simulated trades while watching the market.

Here's how to run a different selector (example: ETH-BTC on Poloniex):

```
./zenbot trade poloniex.eth-btc
```

For a full list of options for the `trade` command, use:

```
zenbot trade --help

  Usage: trade [options] [selector]

  run trading bot against live market data

  Options:

    -h, --help                      output usage information
    --strategy <name>               strategy to use
    --order_type <type>             order type to use (maker/taker)
    --paper                         use paper trading mode (no real trades will take place)
    --currency_capital <amount>     for paper trading, amount of start capital in currency
    --asset_capital <amount>        for paper trading, amount of start capital in asset
    --buy_pct <pct>                 buy with this % of currency balance
    --sell_pct <pct>                sell with this % of asset balance
    --markup_pct <pct>              % to mark up or down ask/bid price
    --order_adjust_time <ms>        adjust bid/ask on this interval to keep orders competitive
    --sell_stop_pct <pct>           sell if price drops below this % of bought price
    --buy_stop_pct <pct>            buy if price surges above this % of sold price
    --profit_stop_enable_pct <pct>  enable trailing sell stop when reaching this % profit
    --profit_stop_pct <pct>         maintain a trailing stop this % below the high-water mark of profit
    --max_sell_loss_pct <pct>       avoid selling at a loss pct under this float
    --max_slippage_pct <pct>        avoid selling at a slippage pct above this float
    --rsi_periods <periods>         number of periods to calculate RSI at
    --poll_trades <ms>              poll new trades at this interval in ms
    --disable_stats                 disable printing order stats
    --reset_profit                  start new profit calculation from 0

```

and also:

```
zenbot list-strategies

macd
  description:
    Buy when (MACD - Signal > 0) and sell when (MACD - Signal < 0).
  options:
    --period=<value>  period length (default: 1h)
    --min_periods=<value>  min. number of history periods (default: 52)
    --ema_short_period=<value>  number of periods for the shorter EMA (default: 12)
    --ema_long_period=<value>  number of periods for the longer EMA (default: 26)
    --signal_period=<value>  number of periods for the signal EMA (default: 9)
    --up_trend_threshold=<value>  threshold to trigger a buy signal (default: 0)
    --down_trend_threshold=<value>  threshold to trigger a sold signal (default: 0)
    --overbought_rsi_periods=<value>  number of periods for overbought RSI (default: 25)
    --overbought_rsi=<value>  sold when RSI exceeds this value (default: 70)

trend_ema (default)
  description:
    Buy when (EMA - last(EMA) > 0) and sell when (EMA - last(EMA) < 0). Optional buy on low RSI.
  options:
    --period=<value>  period length (default: 20m)
    --min_periods=<value>  min. number of history periods (default: 52)
    --trend_ema=<value>  number of periods for trend EMA (default: 30)
    --neutral_rate=<value>  avoid trades if abs(trend_ema) under this float (0 to disable, "auto" for a variable filter) (default: 0)
    --oversold_rsi_periods=<value>  number of periods for oversold RSI (default: 25)
    --oversold_rsi=<value>  buy when RSI reaches this value (default: 30)
```

### Reading the console output

![console](https://rawgit.com/carlos8f/zenbot/master/assets/console.png)

From left to right:

- Timestamp in local time (grey, blue when showing "live" stats)
- Asset price in currency (yellow)
- Percent change of price since last period (red/green)
- Volume in asset since last period (grey)
- [RSI](http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:relative_strength_index_rsi) ANSI graph (red/green)
- `trend_ema_rate` (red/green, explained below)
- Current signal or action, including `buy`, `sell`, `buying`, `selling`, `bought`, `sold` and `last_trade_worth` (percent change in the trend direction since last buy/sell)
- Account balance (asset)
- Account balance (currency)
- Profit or loss percent (can be reset with `--reset_profit`)
- Gain or loss vs. buy/hold strategy

### About the ema_trend strategy (default)

- The default strategy is called `trend_ema` and resides at `./extensions/trend_ema`.
- Defaults to using a 20m period, but you can override this with adding e.g. `--period=5m` to the `sim` or `trade` commands.
- Computes the 30-period EMA of the current price, and calculates the percent change from the last period's EMA to get the `trend_ema_rate`
- Considers `trend_ema_rate >= 0` an upwards trend and `trend_ema_rate < 0` a downwards trend
- Filters out low values (whipsaws) by `neutral_rate`, which when set to `auto`, uses the standard deviation of the `trend_ema_rate` as a variable noise filter.
- Buys at the beginning of upwards trend, sells at the beginning of downwards trend
- If `oversold_rsi` is set, tries to buy when the RSI dips below that value, and then starts to recover (a counterpart to `--profit_stop_enable_pct`, which sells when a percent of profit is reached, and then dips)
- The bot will always try to avoid trade fees, by using post-only orders and thus being a market "maker" instead of a "taker". Some exchanges will, however, not offer maker discounts.

### About the macd strategy

The moving average convergence divergence calculation is a lagging indicator, used to follow trends. 

- Can be very effective for trading periods of 1h, with a shorter period like 15m it seems too erratic and the Moving Averages are kind of lost.
- It's not firing multiple 'buy' or 'sold' signals, only one per trend, which seems to lead to a better quality trading scheme.
- Especially when the bot will enter in the middle of a trend, it avoids buying unless it's the beginning of the trend.

### Option tweaking tips

- Trade frequency is adjusted with a combination of `--period` and `--trend_ema`. For example, if you want more frequent trading, try `--period=5m` or `--trend_ema=20` or both. If you get too many ping-pong trades or losses from fees, try increasing `period` or `trend_ema`.
- Sometimes it's tempting to tell the bot trade very often. Try to resist this urge, and go for quality over quantity, since each trade comes with a decent amount of slippage and whipsaw risk.
- `--oversold_rsi=<rsi>` will try to buy when the price dives. This is one of the ways to get profit above buy/hold, but setting it too high might result in a loss of the price continues to fall.
- In a market with predictable price surges and corrections, `--profit_stop_enable_pct=10` will try to sell when the last buy hits 10% profit and then drops to 9% (the drop % is set with `--profit_stop_pct`). However in strong, long uptrends this option may end up causing a sell too early.
- As of v4.0.5, the `--neutral_rate=auto` filter is disabled, which is currently producing better results with the new default 20m period. Some coins may benefit from `--neutral_rate=auto` though, try simulating with and without it.
- For Kraken and GDAX you may wish to use `--order_type="taker"`, this uses market orders instead of limit orders. You usually pay a higher fee, but you can be sure that your order is filled instantly. This means that the sim will more closely match your live trading. Please note that GDAX does not charge maker fees (limit orders), so you will need to choose between not paying fees and running the risk orders do not get filled on time, or paying somewhat high % of fees and making sure your orders are always filled on time.

## Manual trade tools

Zenbot's order execution engine can also be used for manual trades. Benefits include:

- Avoids market-order fees by using a short-term limit order
- Can automatically determine order size from account balance
- Adjusts order every 30s (if needed) to ensure quick execution
- If an order is partially filled, attempts to re-order with remaining size

The command to buy is:

```
zenbot buy <selector> [--size=<size>] [--pct=<pct>]
```

For example, to use your remaining USD balance in GDAX to buy Bitcoin:

```
zenbot buy gdax.BTC-USD
```

Or to sell 10% of your BTC,

```
zenbot sell gdax.BTC-USD --pct=10
```

## Update Log

- [v4.0.5](https://github.com/carlos8f/zenbot/releases/tag/v4.0.5) (Latest)
    - handle insufficient funds errors from gdax
    - new trend_ema defaults adjusted for latest btc movements: 20m period, neutral_rate=0
    - include more data in sim output
    - remove rarely useful trend_ema options
    - avoid abort in trader on failed getTrades()
- v4.0.4
    - debugging for polo odd results
    - sim: simplify and correct makerFee assessment
    - fix conf path in API credentials errors
    - fix order total under 0.0001 error on polo
    - Docker: extend README slightly (thanks [@DeviaVir](https://github.com/deviavir) and [@egorbenko](https://github.com/egorbenko))
    - docker-compose: do not expose mongodb by default! (thanks [@DeviaVir](https://github.com/deviavir))
- v4.0.3
    - fix for docker mongo host error
    - link for new Discord chat!
    - fix polo crash on getOrder weird result
    - fix oversold_rsi trigger while in preroll
    - fix polo "not enough..." errors
    - fancy colors for price report
    - display product id in report
    - fix poloniex backfill batches too big, mongo timeouts
    - fix cursorTo() crash on some node installs
    - memDump for debugging order failures
    - fix column spacing on progress report
- v4.0.2
    - minor overhaul to trend_ema strat - added whipsaw filtering via std. deviation (`--neutral_rate=auto`)
    - trim preroll of sim result graph
- v4.0.1
    - Added .dockerignore (thanks [@sulphur](https://github.com/sulphur))
    - fix crashing on mongo timeout during backfill
    - fix gaps in poloniex backfill
    - default backfill days 90 -> 14

## TODO

- determine and fix what is causing live trading to underperform vs. paper trading/simulations
- improve order execution speed, possibly by using market-type orders (incurring taker fees)
- support for limiting the amount of balance Zenbot can use for trading
- fix partial filled orders sometimes not getting recognized, due to race conditions
- tool to generate graph and stats from live or paper trading sessions
- save sim data to db, for front-end UI
- make error output compact, no stack trace
- review PR for Bitfinex
- more exchange support
- web UI with graphs and logs
- "reaper" to automatically prune trades collection to a certain day length
- "lite mode" for trader, an option to run without MongoDB

## Donate

P.S., some have asked for how to donate to Zenbot development. I accept donations at **my Bitcoin address** Here:

### carlos8f's BTC

`187rmNSkSvehgcKpBunre6a5wA5hQQop6W`

![zenbot logo](https://rawgit.com/carlos8f/zenbot/master/assets/zenbot_square.png)

Thanks!

- - -

### License: MIT

- Copyright (C) 2017 Carlos Rodriguez
- Copyright (C) 2017 Terra Eclipse, Inc. (http://www.terraeclipse.com/)

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
