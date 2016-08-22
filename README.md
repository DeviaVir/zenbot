![zenbot logo](https://rawgit.com/carlos8f/zenbot/master/assets/zenbot_3_logo.png)

[![GitPitch](https://gitpitch.com/assets/badge.svg)](https://gitpitch.com/carlos8f/zenbot/master?t=moon)

> “To follow the path, look to the master, follow the master, walk with the master, see through the master, become the master.”
> – Zen Proverb

- New to Zenbot? Watch the slideshow: [Introducing Zenbot 3](https://gitpitch.com/carlos8f/zenbot/master?t=moon)
- Follow Zenbot [on Twitter!](https://twitter.com/zenbot_btc)
- Check out Zenbot's [live feed!](https://zenbot.s8f.org/)
- Join the discussion on [Reddit!](https://www.reddit.com/r/Bitcoin/comments/4xqo8q/announcing_zenbot_3_your_new_btcethltc_trading/)!
- Want to contribute to Zenbot? Read the [contributions guide](https://github.com/carlos8f/zenbot/blob/master/CONTRIBUTING.md)

## Description

Zenbot is a lightweight, extendable, artificially intelligent trading bot. Currently Zenbot is capable of:

- High-frequency trading, day trading, week trading
- Multiple asset support for Bitcoin, Ether, Litecoin (and more)
- Multiple currency support for US Dollars, Euros, Chinese Yuan (and more)
- Multiple exchange support for Bitfinex, GDAX, Kraken, Poloniex (and more)
- Realtime consuming and analysis of trade data
- [Backtesting your trade strategy](https://gist.github.com/carlos8f/54c7afd4c9300ad9ea9cbccb294faebd)
- Outputting data as [CSV](https://zenbot.s8f.org/data.csv), [JSON](https://gist.githubusercontent.com/carlos8f/54c7afd4c9300ad9ea9cbccb294faebd/raw/d7d92115da305b686afbccec899f134c87d909f8/sim_result.json), or [candlestick graph](https://zenbot.s8f.org/)

### Performance

Current simulations on historical data from May - August 2016 show Zenbot 3.2.3 [**DOUBLING its investment**](https://gist.github.com/carlos8f/54c7afd4c9300ad9ea9cbccb294faebd) in only 12 weeks, using default parameters!

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

In the screenshot below, the pink arrows represent the bot buying (up arrow) and selling (down arrow) as it iterated the historical data of [GDAX](https://gdax.com/) exchange's BTC/USD product. The simulation iterated 3 months of data and ended with 198% balance, an unbelieveable 90% [ROI](https://en.wikipedia.org/wiki/Return_on_investment).

![screenshot](https://cloud.githubusercontent.com/assets/106763/17820631/94c99a20-6602-11e6-8175-39b71c6a085e.png)

RAW data from simulation: https://gist.github.com/carlos8f/54c7afd4c9300ad9ea9cbccb294faebd

## Quick-start

### 1. Requirements: [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/download-center)

#### Windows - I don't support it.

If you're having an error on Windows and you're about to give up, it's probably because Node.js is generally broken on Windows and you should try running on a Linux docker container or a Mac instead.

If you're still insistent on using Windows, you'll have to fork zenbot, fix it yourself, and I'll accept a Pull Request.

### 2. Install zenbot 3:

```
git clone https://github.com/carlos8f/zenbot.git
cd zenbot
npm install
```

### 3. Edit `config.js` with API keys, database credentials, trade logic, etc.

### 4. Run zenbot:

```
./run.sh
```

### 5. Open the live graph URL provided in the console.

To access the CLI,

```
zenbot

  Usage: zenbot [options] [command]

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
```

The `./run.sh` script combines `launch map --backfill reduce run server`, so use the CLI to access the other commands.

### 6. Simulation

Once backfill has finished, run a simulation:

```
zenbot sim [--verbose]
```

Zenbot will return you a list of virtual trades, and an ROI figure. Open the URL provided in the console (while running the server) to see the virtual trades plotted on a candlestick graph. Tweak `default_logic.js` for new trade strategies and check your results this way.

Example simulation result: https://gist.github.com/carlos8f/54c7afd4c9300ad9ea9cbccb294faebd

#### About the default trade logic in `default_logic.js`

- uses [GDAX](https://gdax.com/) API
- watches BTC/USD
- acts at 1m increments (ticks), but you can configure to act quicker or slower.
- computes the latest 14-hour [RSI](http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:relative_strength_index_rsi)
- considers `RSI >= 70` an upwards trend and `RSI <= 30` a downwards trend
- Buys at the beginning of upwards trend, sells at the beginning of downwards trend
- trades 95% of current balance, market price
- Holds for min. 100 minutes after a trade

You can tweak the JS from there to use bitfinex, or trade ETH, or whatever. After tweaking `default_logic.js`, Use `zenbot sim` to check your strategy against historical trades.

Note that simulations always end on Wednesday 5pm PST, and run for a max 84 days (12 weeks), to ensure input consistency.

Auto-learn support and more exchange support will come soon. Will accept PR's :) With the 3.x plugin architecture, external plugins are possible too (published as their own repo/module).

### 7. Web console

When the server is running, and you have visited the `?secret` URL provided in the console, you can access an aggregated, live feed of log messages at `http://localhost:3013/logs`. Example:

![screenshot](https://raw.githubusercontent.com/carlos8f/zenbot/master/assets/zenbot_web_logs.png)

### Update Log

- [**3.4.1**](https://github.com/carlos8f/zenbot/releases/tag/v3.4.1) (Latest)
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

![zenbot logo](https://s8f.org/files/bitcoin.png)

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
