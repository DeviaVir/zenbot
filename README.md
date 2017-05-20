![zenbot logo](https://rawgit.com/carlos8f/zenbot/4.x/assets/logo.png)

> “To follow the path, look to the master, follow the master, walk with the master, see through the master, become the master.”
> – Zen Proverb

## Description

Zenbot is a lightweight, extendable cryptocurrency trading bot. It features:

- Fully-automated technical-analysis-based trading approach
- Full out-of-the-box support for [GDAX](https://gdax.com/) and [Poloniex](https://poloniex.com)
- Plugin architecture for implementing exchange support, or writing new strategies
- Simulator for [Backtesting strategies](https://gist.github.com/carlos8f/b09a734cf626ffb9bb3bcb1ca35f3db4) against historical data
- "Paper" trading mode, operates on a simulated balance while watching the live market
- Configurable sell stops, buy stops, and (trailing) profit stops
- Flexible sampling period and trade frequency - averages 1-2 trades/day with 1h period, 10/day with 15m period

### Disclaimer

- BE AWARE that Zenbot is not a sure-fire profit machine.
- Running a bot, and trading in general requires careful study of the risks and parameters involved.
- Once you hook up Zenbot to a live exchange, the damage done is your fault, not mine!
- Crypto-currency is still an experiment, and therefore so is Zenbot. Meaning, both may fail at any time.
- Often times the default trade parameters will underperform vs. a buy-hold strategy, so run some simulations and find the optimal parameters for your chosen exchange/pair before going "all-in".

## Screenshot

Zenbot outputs an HTML graph of each simulation result. In the screenshot below, the pink arrows represent the bot buying (up arrow) and selling (down arrow) as it iterated the historical data of [GDAX](https://gdax.com/) exchange's BTC/USD product.

![screenshot](https://cloud.githubusercontent.com/assets/106763/25983930/7e5f9436-369c-11e7-971b-ba2916442eea.png)

Zenbot started with $1,000 USD and ended with $2,954.50 after 90 days, making a 195% ROI! In spite of a buy/hold strategy returning a respectable 83.44%, Zenbot has considerable potential for beating buy/holders.

- Note that this example used tweaked settings to achieve optimal return: `--enable_profit_stop_pct=10`, `--profit_stop_pct=4`, `trend_ema=36`, and `--sell_rate=-0.006`. Default parameters yielded around 65% ROI.
- RAW data from simulation: https://gist.github.com/carlos8f/b09a734cf626ffb9bb3bcb1ca35f3db4

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

View and edit `conf.js`. It's possible to use zenbot in "paper trading" mode without making any changes. You must add your exchange API keys to enable real trading however.

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

At the end of your simulation, you'll see something like:

```
end balance 2621.45651320 (162.15%)
buy hold 1866.90203832 (86.69%)
vs. buy hold 40.42%
90 trades over 92 days (avg 0.98 trades/day)
wrote sim_result.html
```

- By default the sim will start with 1000 units of currency. Override with `--currency_capital` and `--asset_capital`.
- Here we can see the bot's ROI of 162% beat the buy/hold strategy by a lot!
- Open `sim_result.html` in your browser to see a candlestick graph with trades.

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

trend_ema (default)
  description:
    Buy when (EMA - last(EMA) > 0) and sell when (EMA - last(EMA) < 0). Optional buy on low RSI.
  options:
    --period=<value>  period length (default: 1h)
    --min_periods=<value>  min. number of history periods (default: 36)
    --trend_ema=<value>  number of periods for trend EMA (default: 34)
    --buy_rate=<value>  buy if trend ema rate between 0 and this positive float (default: 0)
    --sell_rate=<value>  sell if trend ema rate between 0 and this negative float (default: 0)
    --max_buy_duration=<value>  avoid buy if trend duration over this number (default: 1)
    --max_sell_duration=<value>  avoid sell if trend duration over this number (default: 1)
    --oversold_rsi_periods=<value>  number of periods for oversold RSI (default: 14)
    --oversold_rsi=<value>  buy when RSI reaches this value (default: 0)
```

### Reading the console output

[console](https://rawgit.com/carlos8f/zenbot/4.x/assets/console.png)

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

### About the default strategy

- The default strategy is called `trade_ema` and resides at `./extensions/trade_ema`.
- defaults to using a 1h period, but you can override this with adding e.g. `--period=15m` to the `sim` or `trade` commands.
- computes the 34-period EMA of the current price and subtracts the previous period's calculation from that to get the `trend_ema_rate`
- considers `trend_ema_rate >= 0` an upwards trend and `trend_ema_rate < 0` a downwards trend
- Buys at the beginning of upwards trend, sells at the beginning of downwards trend
- Can be prone to "whipsaws" when the EMA rate oscillates around 0.

### Option tweaking tips

- Trade frequency is adjusted with a combination of `--period` and `--trend_ema`. For example, if you want more frequent trading, try `--period=15m` or `--trend_ema=25` or both. If you get too many ping-pong trades or losses from fees, try increasing `period` or `trend_ema`.
- Sometimes it's tempting to tell the bot trade very often. Try to resist this urge, and go for quality over quantity, since each trade comes with a decent amount of slippage and whipsaw risk.
- In a bull market, `--sell_rate=-0.01` and `--max_sell_duration=8` can give the price a chance to recover before selling. If there is a sudden dive in price, it's assumed it will recover and sell is delayed. Compensate for the risk by using `--sell_stop_pct=5`.
- In a bull market with regular price dives and recoveries, `--oversold_rsi=25` will try to buy when the price dives.
- In a market with predictable price surges and corrections, `--profit_stop_enable_pct=10` will try to sell when the last buy hits 10% profit and then drops to 9%.

## TODO

- more exchange support
- web UI with graphs and logs

## Donate

P.S., some have asked for how to donate to Zenbot development. I accept donations at **my Bitcoin address** Here:

### carlos8f's BTC

`187rmNSkSvehgcKpBunre6a5wA5hQQop6W`

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
