#HSLIDE

Press **F** key to go fullscreen.

#HSLIDE

![zenbot logo](https://rawgit.com/carlos8f/zenbot/master/assets/zenbot_3_logo.png)

#VSLIDE

Introducing <span style="color:lime">Zenbot 3</span>span>

### Zenbot Features

- Fully-automated BTC, ETH, LTC trading
- Under the hood, uses ["Zenbrain"](https://github.com/carlos8f)
- Neural network analyzes new data in realtime

#VSLIDE

### Zenbot Features cont'd

- Multi-currency: trade USD, EUR, GBP, CNY
- Multi-exchange: realtime Kraken, Poloniex, and Bitfinex tracking.
- Blazing [ROI](https://en.wikipedia.org/wiki/Return_on_investment) of up to [117%](https://github.com/carlos8f/zenbot/issues/25) profit in 3 months!!?

#HSLIDE

### HOWEVER. Bitcoin (and altcoin) is high, risk, high reward.

USE ZENBOT AT YOUR OWN RISK.

### And, like a car, <span style="color:red">_NEVER_</span> leave the bot unattended!

#VSLIDE

### Super-easy setup

- Clone the repo, `npm install`, and launch `./run.sh`!
- Auto-trading support for [GDAX](https://gdax.com/) is included. Just add your API key and currency pair!
- Trading support for other exchanges are a [work in progress](https://github.com/carlos8f/zenbot/issues)!

#VSLIDE

### Strategy tweaking

- Trade strategy is fully exposed in the config file.
- This allows you to have full control over the bot's actions and logic.
- Run the simulator to test your strategy!

```
zenbot sim [--verbose]
```

#HSLIDE

### We got PRETTY graphs!

![screenshot](https://cloud.githubusercontent.com/assets/106763/17820631/94c99a20-6602-11e6-8175-39b71c6a085e.png)

#VSLIDE

### In depth:

- The simulation started with **$1,000**
- iterated 12 weeks of data, May-August 2016
- generated 80 virtual BTC/USD trades on GDAX exchange
- ended with a balance of $1,986.99!

#HSLIDE

### Out of the box, Zenbot

- uses [GDAX](https://gdax.com/) API
- watches BTC/USD
- acts at 1-minute increments (ticks)
- computes the latest 14-hour [RSI](http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:relative_strength_index_rsi)

#HSLIDE

### Default logic cont'd.

- considers `RSI >= 70` an upwards trend and `RSI <= 30` a downwards trend.
- Buys during upwards trend, sells during downwards trend.
- trades 95% of current balance, market price.

#HSLIDE

### And finally,

- Holds for 100+ minutes after a trade.
- Tweak the JS to trade on Bitfinex, or trade ETH, or what have you!
- After tweaking `default_logic.js`, Use `zenbot sim` to check your strategy against historical trades.

#HSLIDE

### How much profit can I expect?

#HSLIDE

This default logic makes up to [89% profit on current simulations](https://gist.github.com/carlos8f/e8237b3089a2b316093e5e8aac1469e8).

#HSLIDE

### 7. Web console

![screenshot](https://raw.githubusercontent.com/carlos8f/zenbot/master/assets/zenbot_web_logs.png)

#HSLIDE

## Neural Networks are the future!

- In various studies, **neural networks** outperform traditional linear technical analysis.
- ANN's can be mathematically and empirically verified.

#HSLIDE

## Not just for science geeks anymore.

- ANN's have, in the past, been used only in the circles of scientific researchers.
- ANN's are just now becoming available for use in trading.

#HSLIDE

> "Down with humans! LOL" -Zenbot

#VSLIDE

### ACTIVE development!

- Zenbot is deployed as my personal trading bot.
- I update it regularly, as I improve the engine.
- The code is subject to break or change over time.
- Please contribute via Pull Request!

#VSLIDE

### Zenbot on the web!

- Follow Zenbot [on Twitter!](https://twitter.com/zenbot_btc)
- Check out Zenbot's [live feed!](https://zenbot.s8f.org/)
- Join the discussion on [Reddit!](https://www.reddit.com/r/Bitcoin/comments/4xqo8q/announcing_zenbot_3_your_new_btcethltc_trading/)!

#VSLIDE

## Donate

P.S., some have asked for how to donate to Zenbot development. I accept donations at **my Bitcoin address** Here:

![zenbot logo](https://s8f.org/files/bitcoin.png)

thanks!

Cheers,
Carlos

