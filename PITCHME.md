#HSLIDE

Press **F** key to go fullscreen.

#HSLIDE

![zenbot logo](https://rawgit.com/carlos8f/zenbot/master/assets/zenbot_3_logo.png)

#HSLIDE

## USE ZENBOT AT YOUR OWN RISK.

#HSLIDE

#### Zenbot may break or lose money at any time

#### **DO NOT** leave the bot unattended!

#HSLIDE

### A little Zen-Spiration

> “To follow the path, look to the master, follow the master, walk with the master, see through the master, become the master.”
> – Zen Proverb

#HSLIDE

# Zenbot supports:

- High-frequency trading, day trading, week trading
- Multiple asset support for Bitcoin, Ether, Litecoin (and more)

#HSLIDE

## Zenbot is flexible:

- Multiple currency support for US Dollars, Euros, Chinese Yuan (and more)
- Multiple exchange support for Bitfinex, GDAX, Kraken, Poloniex (and more)

#HSLIDE

## Pluggable trading:

- Trading support for [GDAX](https://gdax.com/) is included
- Trading support for other exchanges are a [work in progress](https://github.com/carlos8f/zenbot/issues)

#HSLIDE

## Zenbot features:

- A powerful map/reduce system
- A plugin system to facilitate incremental/expandable feature support

#HSLIDE

# How do I turn it on?

- Simply add your API key and chosen currency pair to `config.js`
- `./run.sh`

#HSLIDE

## How do I see/change the strategy?

- Trade strategy is fully exposed in the config file.
- This allows you to have full control over the bot's actions and logic.

#HSLIDE

## How can I visualize what the bot does?

- A live candlestick graph is provided via a built-in HTTP server.
- A live HTTP console is provided to monitor bot activity.

## Okay I'm curious now show me more.

- In the next screenshot, the pink arrows represent the bot buying (up arrow) and selling (down arrow) as it iterated the historical data of [GDAX](https://gdax.com/) exchange's BTC/USD product.

#HSLIDE

![screenshot](https://cloud.githubusercontent.com/assets/106763/17820631/94c99a20-6602-11e6-8175-39b71c6a085e.png)

#HSLIDE

## Data doesn't lie:

- The simulation started with **$1,000**
- iterated 12 weeks of data, May-August 2016
- ended with a balance of...

#HSLIDE

# $1,986.99 ?!?

#HSLIDE

## Yes, it actually doubled the investment!

#HSLIDE

# Me: _"Zenbot, you're a genius!"_

#HSLIDE

> Zenbot: "Down with humans! LOL"

#HSLIDE

## How do I install Zenbot?

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

## Zenbot plugins

- Zenbot is readily expandable by plugins.
- See `./core` and `./plugins` for examples of what plugins can do!

#HSLIDE

### More about plugins

- Auto-learn support and more exchange support will come soon.
- Will accept PR's :) With the 3.x plugin architecture, external plugins are possible
- External plugins can publish as their own repo/module.

#HSLIDE

## ACTIVE development!

- Zenbot is deployed as my personal trading bot.
- I update it regularly, as I improve the engine.

#HSLIDE

## Zenbot on the web!

- Follow Zenbot [on Twitter!](https://twitter.com/zenbot_btc)
- Check out Zenbot's [live feed!](https://zenbot.s8f.org/)
- Join the discussion on [Reddit!](https://www.reddit.com/r/Bitcoin/comments/4xqo8q/announcing_zenbot_3_your_new_btcethltc_trading/)!

#HSLIDE

## Donate

P.S., some have asked for how to donate to Zenbot development. I accept donations at **my Bitcoin address** Here:

![zenbot logo](https://s8f.org/files/bitcoin.png)
