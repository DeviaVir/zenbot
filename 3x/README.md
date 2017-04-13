![zenbot logo](https://rawgit.com/carlos8f/zenbot/master/assets/zenbot_3_logo.png)

[![GitPitch](https://gitpitch.com/assets/badge.svg)](https://gitpitch.com/carlos8f/zenbot/master?t=moon)

> “To follow the path, look to the master, follow the master, walk with the master, see through the master, become the master.”
> – Zen Proverb

- New to Zenbot? Watch the slideshow: [Introducing Zenbot 3](https://gitpitch.com/carlos8f/zenbot/master?t=moon)
- Want to contribute to Zenbot? Read the [contributions guide](https://github.com/carlos8f/zenbot/blob/master/CONTRIBUTING.md)

## Current State of Development

Currently Zenbot 3.x works great when set up properly, but setting it up can be **hard**. The configuration system is a bit confusing. To get it to support your exchange of choice sometimes it even involves writing JavaScript.

I'm currently planning an **overhaul for 4.x** that will incorporate a UI, and make many things easier to understand and manage. Stay tuned!

## Description

Zenbot is a lightweight, extendable, artificially intelligent trading bot. Currently Zenbot is capable of:

- High-frequency trading, day trading, week trading
- Multiple asset support for Bitcoin, Ether, Litecoin (and more)
- Multiple currency support for US Dollars, Euros, Chinese Yuan (and more)
- Multiple exchange support for Bitfinex, GDAX, Kraken, Poloniex (and more)
- Realtime consuming and analysis of trade data
- [Backtesting your trade strategy](https://gist.github.com/carlos8f/38a9dd292c7ce4d4425803e9548f7960)
- Outputting data as CSV, [JSON](https://gist.githubusercontent.com/carlos8f/38a9dd292c7ce4d4425803e9548f7960/raw/sim_result.json), or candlestick graph

### Performance

Simulations on historical data from May - August 2016 show Zenbot 3.5.15 making a [1.531 ROI](https://gist.github.com/carlos8f/afcc18ba0e1f422b1f3b1f67a3b05c8e) in only 3 months, using default parameters!

_Zenbot is a genius!_

HOWEVER. BE AWARE that once you hook up Zenbot to a live exchange, the damage done is your fault, not mine! **As with buying crypto currency in general, risk is involved and caution is essential. Crypto currency is an experiment, and so is Zenbot.**

### Features

- A powerful map/reduce system to live-process data at scale.
- A plugin system to facilitate incremental support for any exchange, currency pair, trade strategy, or reporting medium.
- Out of the box, Zenbot is an AI-powered trade advisor (gives you buy or sell signals while watching live data).
- Default support for [GDAX](https://gdax.com/) is included, so if you have a GDAX account, enable bot trades by simply putting your GDAX API key in `config.js` and setting what currency pair to trade.
- Default support for other exchanges is ongoing.
- Trade strategy is fully exposed in the config file. This allows you to have full control over the bot's actions and logic. For example, instead of trading on GDAX, you could trade on a different exchange or currency pair by implementing a few lines of JavaScript.
- A live candlestick graph is provided via a built-in HTTP server.

## Screenshot

In the screenshot below, the pink arrows represent the bot buying (up arrow) and selling (down arrow) as it iterated the historical data of [GDAX](https://gdax.com/) exchange's BTC/USD product.

![screenshot](https://cloud.githubusercontent.com/assets/106763/18077269/4f5deefc-6e39-11e6-9e3e-6d4bba583c03.png)

RAW data from simulation: https://gist.github.com/carlos8f/afcc18ba0e1f422b1f3b1f67a3b05c8e

## Quick-start

### 1. Requirements: [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/download-center)

#### Windows - I don't support it.

If you're having an error on Windows and you're about to give up, it's probably because Node.js is generally broken on Windows and you should try running on a Linux docker container (look at step 7 and follow instructions for Windows) or a Mac instead.

If you're still insistent on using Windows, you'll have to fork zenbot, fix it yourself, and I'll accept a Pull Request.

### 2. Install zenbot 3:

```
git clone https://github.com/carlos8f/zenbot.git
cd zenbot
npm install
# optional, installs the `zenbot` binary in /usr/local/bin:
npm link
```

### 3. Copy `config_sample.js` to `config.js` and edit with API keys, database credentials, trade logic, etc.

Note: add your GDAX key to `config.js` to enable real trading.

### 4. Run zenbot (single-pair mode)

The following command will run all Zenbot functionality, using the default BTC/USD pair.

```
./run.sh
```

Here's how to run a different pair (example: ETH-BTC):

```
./zenbot launch map --backfill reduce run server --config config_eth_btc.js
```

### 4. Run zenbot (multi-pair mode)

The following will run multiple currency pairs along with the reducer and server in separate processes.

Required: reducer (for processing trade data):

```
./reducer.sh
```

Optional: server (for candlestick graphs and aggregated log):

```
./server.sh
```

Required: one or more run scripts (watches trades of a given pair and performs trade actions on the exchange or simulation)

```
./run-btc-usd.sh
```

And/or to trade ETH,

```
./run-eth-usd.sh
```

And/or to trade ETH/BTC,

```
./run-eth-btc.sh
```

### 5. If running server, open the live graph URL provided in the console.

To access the CLI,

```
./zenbot

  Usage: ./zenbot [options] [command]

  Commands:

    server [options]            launch the server
    launch [options] [cmds...]  launch multiple commands
    map [options]               map
    reduce [options]            reduce
    run                         run
    sim [options]               sim

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    --config <path>  specify a path for config.js overrides
```

The `./run.sh` script combines `launch map --backfill reduce run server`, so use the CLI to access the other commands.

### 6. Simulation

Once backfill has finished (should collect about 84 days of data), run a simulation:

```
./zenbot sim [--verbose]
```

Zenbot will return you a list of virtual trades, and an ROI figure. Open the URL provided in the console (while running the server) to see the virtual trades plotted on a candlestick graph. Tweak `default_logic.js` for new trade strategies and check your results this way.

Example simulation result: https://gist.github.com/carlos8f/afcc18ba0e1f422b1f3b1f67a3b05c8e

#### About the default trade logic in `default_logic.js`

- uses [GDAX](https://gdax.com/) API
- acts at 5 minute increments (ticks), but you can configure to act quicker or slower.
- computes the latest 14-hour [RSI](http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:relative_strength_index_rsi) at each 5m tick
- considers `RSI >= 70` an upwards trend and `RSI <= 30` a downwards trend
- Buys at the beginning of upwards trend, sells at the beginning of downwards trend
- trades 98% of current balance, market price
- Holds for min. 24 hours after a trade

You can tweak the JS from there to trade on Bitfinex, or whatever. After tweaking `default_logic.js`, Use `./zenbot sim [--verbose]` to check your strategy against historical trades.

Note that simulations always end on Wednesday 5pm PST, and run for a max 84 days (12 weeks), to ensure input consistency.

Auto-learn support and more exchange support will come soon. Will accept PR's :) With the 3.x plugin architecture, external plugins are possible too (published as their own repo/module).

### 7. Docker

Install Docker, Docker Compose, Docker Machine (if necessary) You can follow instructions at https://docs.docker.com/compose/install/

After installation

```
git clone https://github.com/carlos8f/zenbot.git
cd zenbot
docker-compose build
docker-compose up (-d if you don't want to see the log)
```

### 8. Web console

When the server is running, and you have visited the `?secret` URL provided in the console, you can access an aggregated, live feed of log messages at `http://localhost:3013/logs`. Example:

![screenshot](https://raw.githubusercontent.com/carlos8f/zenbot/master/assets/zenbot_web_logs.png)

### Update Log

- [**3.5.16**](https://github.com/carlos8f/zenbot/releases/tag/v3.5.15) (Latest)
    - Added Docker support, thanks to @egorbenko, @grigio, and @BarnumD !
- **3.5.15**
    - Fixed [RSI smoothing issue](https://github.com/carlos8f/zenbot/issues/53), now RSI is calculated on the run_state instead of the tick. Switched to using heavily smoothed 5m RSI in `default_logic.js`. RSI no longer needs to be backfilled, and is dynamically calculated after applying this update. Raised ROI 1.460 -> 1.531 from last update.
- **3.5.14**
    - Fixed [#39](https://github.com/carlos8f/zenbot/issues/39) 404 for trades.csv
- **3.5.13**
    - Change `check_period` to 5m in trading engine
    - ROI 1.477 -> 1.720
    - Speed up sim by only processing 5m ticks
- **3.5.12**
    - Tweaks to default trade params, ROI = 1.364 -> 1.477
    - Misc warning text changes
- **3.5.11**
    - Fix 1m reporter not working in advisor mode.
- **3.5.10**
    - Fix `run.sh` not starting server.
    - Remove --verbose from new run script.
- **3.5.9**
    - Add --backfill and --verbose to new run script.
- **3.5.8**
    - Fix "skipping historical tick" (prevented bot from acting on trends) issue with Zenbrain update.
    - Fix ANSI graph range again.
    - Added `run.sh` back to run the default pair BTC/USD and reducer/server.
- **3.5.7**
    - make use of rs.rsi for indicators (instead of querying for rsi tick), spacing for ETA.
- **3.5.6**
    - Fix ANSI graph range.
- **3.5.5**
    - ANSI graph now follows RSI instead of SMA.
- **3.5.4**
    - ETA indicator replaces progress, and removal of `hold_ticks` mechanism in favor of wait params in ms. More warnings in default_logic to show what's going on with the trader.
- **3.5.3**
    - Fixed `--config` usage with absolute path.
- **3.5.2**
    - Re-organized some config vars, GDAX key now in `config.js` instead of `config_eth_btc.js` etc.
- **3.5.1**
    - Bugfixes
- **3.5.0**
    - `run.sh` split into 3 scripts. Now you'll need to run `./reducer.sh`, `./server.sh`, and `./run-{asset}-{currency}.sh` in separate windows. Multiple currency pairs can be run in parallel as of Zenbot 3.5.0!
- **3.4.3**
    - Fix sim URL not having selector in it
    - `min_trade` now controlled by `product.min_size`
- **3.4.2**
    - Exit default logic if run command and historical tick
    - Add balance stats to trade actions
    - Add `--config` arg doc. You can switch to using a different config with `--config <path>`
    - Update gist links for newest simulation results.
    - Added `config_eth.js` example config for ETH trading.
- **3.4.1**
    - Slight re-code of `default_logic.js` to fix slipped ROI (1.1 -> 1.8)
    - Added All Poloniex USDT pairs by @JFD3D, Thanks!
- **3.4.0**
    - Re-organized the config so `config.js` is git-ignored, so you should copy `config_sample.js` to `config.js`. `config_defaults.js` provides all options that you can override in `config.js`.
    - Many config variable changes, such as `c.watch_exchanges` instead of `c.enabled_plugins`, see `config_sample.js` for details.
    - Zenbrain updated.
    - Development now happening in `develop` branch, master will be pushed to only on stable releases going forward.
- **3.3.1**
    - Moved ANSI graph column to line up tick_id and num_trades with log_trades columns.
- **3.3.0**
    - Fees now calculated, default `price * size * 0.0025`.
    - `rs.roi` now updated every tick.
    - ANSI graph, balance, ROI, and SMA indicators added.
    - Fix kraken naming by @grigio, Thanks!
    - Added [contributions guide](https://github.com/carlos8f/zenbot/blob/master/CONTRIBUTING.md).
    - Updated slideshow: [Introducing Zenbot 3](https://gitpitch.com/carlos8f/zenbot/master?t=moon)
- **3.2.4**
    - Minor reporting cleanup, added some docs. Minor update to Zenbrain.
- **3.2.3**
    - Fixed some performance issues with RSI backfiller. Updated `update.sh` to run `git stash` before and `git stash pop` after update, to avoid merge conflict when pulling. However you may have to resolve a conflict with your `config.js` after `update.sh` completes, this is normal when config defaults have been updated.
- **3.2.2**
    - Fixed a non-indexed query in Zenbrain.
- **3.2.1**
    - Bugfix for techan.js performance patch
- **3.2.0**
    - Major logic update again.
    - Now using 1h RSI by default. Reporter chimes in every 5m. Trade signals should trigger roughly 2-3 times over a few days.
    - Way better trend detection in `default_logic.js`, 83-day simulated ROI went from ~10% to 89%!
    - Poloniex product update by @RDash21, Kraken product update by @grigio. Thanks!
    - Logic update by @xangma. Thanks!
    - Graph performance patch, submitted to techan.js project at https://github.com/andredumas/techan.js/issues/138
- **3.1.2** - Relaxed backfill timeout. Backfill is slower to let reducer catch up. Reducer report interval -> 30s, Trade report interval -> 30s
- **3.1.1** - Updated zenbrain version.
- **3.1.0**
    - Major logic update. Much of the default trade logic reprogrammed.
    - Moved default logic to `./default_logic.js`.
    - RSI now backfills by default, reconfigured to 15m intervals.

### Update Tips

To update your Zenbot installation, use `./update.sh`. If you have merge conflicts after update, solve them, then run `./run.sh`. If you have runtime JavaScript errors after update, your database might be obsolete. Try dropping your `zenbrain` DB and run `run.sh` again to start with a clean state.

## FAQ

### Can I use zenbot with [X] exchange?

Yes! As long as that exchange has a public API, you can find a plugin (or write one) to interact with that exchange. I accept pull requests if you want to contribute [X] exchange support.

### Why open source?

There is a general lack of open source bots, especially ones with AI. Since I learned how to code by reverse engineering, I publish code so others can do the same, and by doing so I'm saying thanks to Satoshi, Torvalds, djb, et. al for devoting their lives to open source. It might be against my "selfish interest" but in the end it's best for everyone. Plus, I still own the copyright.

### Were there any incidents when the bot's trade made a loss?

I have seen losses in the simulator, so it's possible. It only takes a few minutes of machine learning to gain a comfortable (albeit virtual) profit margin though. If the bot starts losing money, you can always step in and manual trade or shut the bot down to prevent more loss.

### Based on what criteria does the bot decide to close a trade?

zenbot always trades with the "market" flag, i.e. the order never goes on the books, and the trade goes through with whatever price the last system trade was at. This way, zenbot never needs to cancel orders or compare prices.

### What does [bot] not enough currency to buy! mean?

It means the bot tried to buy, but had not enough USD balance to do that. The volume counter resets anyway. If you feel comfortable investing, you can deposit USD in your account and zenbot will use that the next time the trade signal triggers.

## Reading assignment: Systematic trading using neural networks

In mathematical terms, Artificial neural networks (ANNs) are universal function approximators, meaning that given the right data and configured correctly, they can capture and model any input-output relationships. This removes the need for human interpretation of charts to determine entry/exit signals.

As ANNs are essentially non-linear statistical models, their accuracy and prediction capabilities can be both mathematically and empirically tested. In various studies, authors have claimed that neural networks used for generating trading signals given various technical and fundamental inputs have significantly outperformed buy-hold strategies as well as traditional linear technical analysis methods when combined with rule-based expert systems.

While the advanced mathematical nature of such adaptive systems has kept neural networks for financial analysis mostly within academic research circles, in recent years more user friendly neural network software has made the technology more accessible to traders.

Source: [Wikipedia](https://en.wikipedia.org/wiki/Technical_analysis#Systematic_trading)

## Donate

P.S., some have asked for how to donate to Zenbot development. I accept donations at **my Bitcoin address** Here:

### carlos8f's BTC

`187rmNSkSvehgcKpBunre6a5wA5hQQop6W`

thanks!

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
