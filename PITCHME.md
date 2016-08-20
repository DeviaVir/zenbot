#HSLIDE

Press **F** key to go fullscreen.

#HSLIDE

![zenbot logo](https://rawgit.com/carlos8f/zenbot/master/assets/zenbot_3_logo.png)

#HSLIDE

Introducing <span style="color:lime">Zenbot 3</span>span>

### Zenbot Features

- Fully-automated BTC, ETH, LTC trading
- Under the hood, uses ["Zenbrain"](https://github.com/carlos8f)
- Neural network analyzes new data in realtime

#HSLIDE

### Zenbot Features cont'd

- Multi-currency: trade USD, EUR, GBP, CNY
- Multi-exchange: realtime Kraken, Poloniex, and Bitfinex tracking.
- Blazing [ROI](https://en.wikipedia.org/wiki/Return_on_investment) of up to [117%](https://github.com/carlos8f/zenbot/issues/25) profit in 3 months!!?

#HSLIDE

### Bitcoin (and altcoin) is high, risk, high reward.

#HSLIDE

USE ZENBOT AT YOUR OWN RISK.

#HSLIDE

### And, like a car, <span style="color:red">_NEVER_</span> leave the bot unattended!

#HSLIDE

### Super-easy setup

- Clone the repo, `npm install`, and launch `./run.sh`!
- Auto-trading support for [GDAX](https://gdax.com/) is included. Just add your API key and currency pair!
- Trading support for other exchanges are a [work in progress](https://github.com/carlos8f/zenbot/issues)!

#HSLIDE

### Out of the box, Zenbot

- uses [GDAX](https://gdax.com/) API
- watches BTC/USD
- acts at 1-minute increments (ticks)
- computes the latest 14-hour [RSI](http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:relative_strength_index_rsi)

#HSLIDE

### Default logic cont'd.

- considers [RSI](http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:relative_strength_index_rsi) `>= 70` an upwards trend and [RSI](http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:relative_strength_index_rsi) `<= 30` a downwards trend.
- Buys during upwards trend, sells during downwards trend.
- trades 95% of current balance, market price.

#HSLIDE

### And finally,

- Holds for 100+ minutes after a trade.
- Tweak the JS to trade on [Bitfinex](https://bitfinex.com), or trade ETH, or what have you!
- After tweaking `default_logic.js`, Use `zenbot sim` to check your strategy against historical trades.

#HSLIDE

### Strategy tweaking

- Trade strategy is fully exposed in the config file.
- This allows you to have full control over the bot's actions and logic.
- Run the simulator to test your strategy!

```
zenbot sim [--verbose]
```

#HSLIDE

### Current sim results

- The current sim started with **$1,000**
- Iterated 12 weeks of data, May - August 2016
- Generated 80 virtual BTC/USD trades on [GDAX](https://gdax.com) exchange

#HSLIDE

- ...ended with a balance of **$1,986.99**
- `current ROI = 1.986`

#HSLIDE

![screenshot](https://cloud.githubusercontent.com/assets/106763/17820631/94c99a20-6602-11e6-8175-39b71c6a085e.png)

#HSLIDE

## Neural Networks are the future.

- ANN's can be mathematically and empirically verified.
- In various studies, **neural networks** outperform traditional linear technical analysis.

#HSLIDE

## Not just for science geeks anymore.

- ANN's have, in the past, been used only in the circles of scientific researchers.
- ANN's are just now becoming available for use in trading.

#HSLIDE

> "Down with humans! LOL" -Zenbot

#HSLIDE

### ACTIVE development

- Zenbot is deployed as my personal trading bot.
- Subject to break or change over time.
- Please contribute via Pull Request!

#HSLIDE

### Zenbot on the web

- Follow Zenbot [on Twitter](https://twitter.com/zenbot_btc)
- Check out Zenbot's [live feed](https://zenbot.s8f.org/)
- Join the discussion on [Reddit](https://www.reddit.com/r/Bitcoin/comments/4xqo8q/announcing_zenbot_3_your_new_btcethltc_trading/)!

#HSLIDE

## Donate

P.S., some have asked for how to donate to Zenbot development. I accept donations at **my Bitcoin address** Here:

![zenbot logo](https://s8f.org/files/bitcoin.png)

thanks!

Cheers,
Carlos
