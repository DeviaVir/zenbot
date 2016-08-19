![zenbot logo](https://rawgit.com/carlos8f/zenbot/master/assets/zenbot_3_logo.png)

> “To follow the path, look to the master, follow the master, walk with the master, see through the master, become the master.”
> – Zen Proverb

#HSLIDE

Zenbot is a lightweight, extendable, artificially intelligent trading bot. Currently Zenbot is capable of:

- High-frequency trading, day trading, week trading
- Multiple asset support for Bitcoin, Ether, Litecoin (and more)
- Multiple currency support for US Dollars, Euros, Chinese Yuan (and more)
- Multiple exchange support for Bitfinex, GDAX, Kraken, Poloniex (and more)

#HSLIDE

- Realtime consuming and analysis of trade data
- Simulating your trade strategy using the historical data
- Outputting data as CSV, JSON, or candlestick graph

#HSLIDE

Current simulations on historical data from May - August 2016 show Zenbot 3.2.3 [**DOUBLING its investment**](https://gist.github.com/carlos8f/54c7afd4c9300ad9ea9cbccb294faebd) in only 12 weeks, using default parameters!

#HSLIDE

# _"Zenbot, you're a genius!"_

> Yes I am!

HOWEVER. BE AWARE that once you hook up Zenbot to a live exchange, the damage done is your fault, not mine! **As with buying crypto currency in general, risk is involved and caution is essential. Crypto currency is an experiment, and so is Zenbot.**

#HSLIDE

# Features

- A powerful map/reduce system to live-process data at scale.
- A plugin system to facilitate incremental support for any exchange, currency pair, trade strategy, or reporting medium.
- Out of the box, Zenbot is an AI-powered trade advisor (gives you buy or sell signals while watching live data).
- Default support for [GDAX](https://gdax.com/) is included, so if you have a GDAX account, enable bot trades by simply putting your GDAX API key in `config.js` and setting what currency pair to trade.

#HSLIDE

- Default support for other exchanges is ongoing.
- Trade strategy is fully exposed in the config file. This allows you to have full control over the bot's actions and logic. For example, instead of trading on GDAX, you could trade on a different exchange or currency pair by implementing a few lines of JavaScript.
- A live candlestick graph is provided via a built-in HTTP server.

#HSLIDE

In the next screenshot, the pink arrows represent the bot buying (up arrow) and selling (down arrow) as it iterated the historical data of [GDAX](https://gdax.com/) exchange's BTC/USD product. The simulation iterated 12 weeks of data and ended with 198% balance, an unbelieveable 90% [ROI](https://en.wikipedia.org/wiki/Return_on_investment).

#HSLIDE

![screenshot](https://cloud.githubusercontent.com/assets/106763/17820631/94c99a20-6602-11e6-8175-39b71c6a085e.png)

#HSLIDE

## Quick-start

### 1. Requirements: [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/download-center)

#HSLIDE

### 2. Install zenbot 3:

```
git clone https://github.com/carlos8f/zenbot.git
cd zenbot
npm install
```

#HSLIDE

### 3. Edit `config.js` with API keys, database credentials, trade logic, etc.

#HSLIDE

### 4. Run zenbot:

```
./run.sh
```

#HSLIDE

### 5. Open the live graph URL provided in the console.

#HSLIDE

### 6. Simulation

Once backfill has finished, run a simulation:

```
zenbot sim [--verbose]
```

- Zenbot will return you a list of virtual trades, and an ROI figure.
- Open the URL provided in the console (while running the server) to see the virtual trades plotted on a candlestick graph.
- Tweak `config.js` for new trade strategies and check your results this way.

#HSLIDE

### Default trade logic

- uses [GDAX](https://gdax.com/) API
- watches BTC/USD
- acts at 1m increments (ticks), but you can configure to act quicker or slower.
- computes the latest 14-hour [RSI](http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:relative_strength_index_rsi)

#HSLIDE

#### Default logic cont'd.

- considers `RSI >= 70` an upwards trend and `RSI <= 30` a downwards trend
- Buys at the beginning of upwards trend, sells at the beginning of downwards trend
- trades 95% of current balance, market price

#HSLIDE

- Holds for min. 100 minutes after a trade
- You can tweak the JS from there to use bitfinex, or trade ETH, or whatever.
- After tweaking `default_logic.js`, Use `zenbot sim` to check your strategy against historical trades.

#HSLIDE

### 7. Web console

When the server is running, and you have visited the `?secret` URL provided in the console, you can access an aggregated, live feed of log messages at `http://localhost:3013/logs`. Example:

![screenshot](https://raw.githubusercontent.com/carlos8f/zenbot/master/assets/zenbot_web_logs.png)

## How does it work?

#HSLIDE

_It's a Neural Network!_

#HSLIDE

- Artificial Neural Networks (ANNs) are a type of Universal Function Approximator (UFA).
- Given the right data and configured correctly, they can capture and model any input-output relationships.
- This removes the need for human interpretation of charts to determine entry/exit signals.
- Zenbot creates and maintains its own Neural Network in MongoDB to power its financial analysis.

#HSLIDE

## General facts about ANN trading

- ANN's can be both mathematically and empirically tested using simulations.
- In various studies, authors have claimed that neural networks used for generating trading signals given various technical and fundamental inputs.
- ANN's significantly outperformed buy-hold strategies as well as traditional linear technical analysis methods when combined with rule-based expert systems.

#HSLIDE

- ANN's have, in the past, been used only in the circles of scientific researchers.
- ANN's are just now becoming available for use in trading.

Source: [Wikipedia](https://en.wikipedia.org/wiki/Technical_analysis#Systematic_trading)

#HSLIDE

## Zenbot has a plugin system

Note that simulations always end on Wednesday 5pm PST, and run for a max 84 days (12 weeks), to ensure input consistency.

Auto-learn support and more exchange support will come soon. Will accept PR's :) With the 3.x plugin architecture, external plugins are possible too (published as their own repo/module).

## Donate

P.S., some have asked for how to donate to Zenbot development. I accept donations at **my Bitcoin address** Here:

![zenbot logo](https://s8f.org/files/bitcoin.png)

#HSLIDE

## ACTIVE development happening!

Zenbot is deployed as my personal trading bot. I update it regularly, as I improve the engine.

#HSLIDE

## Zenbot is on the web!

- Follow Zenbot [on Twitter!](https://twitter.com/zenbot_btc)
- Check out Zenbot's [live feed!](https://zenbot.s8f.org/)
- Join the discussion on [Reddit!](https://www.reddit.com/r/Bitcoin/comments/4xqo8q/announcing_zenbot_3_your_new_btcethltc_trading/)!
