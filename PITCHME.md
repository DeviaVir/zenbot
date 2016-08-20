#HSLIDE

Press **F** key to go fullscreen.

#HSLIDE

![zenbot logo](https://rawgit.com/carlos8f/zenbot/master/assets/zenbot_3_logo.png)

#HSLIDE

# <span style="color:lime">Zenbot 3</span>

- Fully-automated <span style="color:lime">BTC, ETH, LTC</span> trading
- Under the hood, uses ["Zenbrain"](https://github.com/carlos8f), a purpose-built neural network
- Analyzes new trades in <span style="color:lime">realtime</span>

#HSLIDE

- Multi-currency: trade <span style="color:lime">USD, EUR, GBP, CNY</span>
- Multi-exchange: realtime <span style="color:lime">Kraken, Poloniex, and Bitfinex</span> tracking.
- Blazing [ROI](https://en.wikipedia.org/wiki/Return_on_investment) performance

#HSLIDE

USE ZENBOT AT YOUR OWN <span style="color:red">RISK.</span>

#HSLIDE

That said,

### Running Zenbot is high <span style="color:red">risk</span>, high <span style="color:lime">reward</span>.

#HSLIDE

- Requires Linux or Mac, [Node.js](https://nodejs.org) and [MongoDB](https://mongodb.com)
- Clone the repo, `npm install`, and launch `./run.sh`!

#HSLIDE

- Auto-trading support for [GDAX](https://gdax.com/) is included.
- Just add your API key and currency pair!
- Trading support for other exchanges are a [work in progress](https://github.com/carlos8f/zenbot/issues)!

#HSLIDE

### Out of the box:

- **Uses** [GDAX](https://gdax.com/) API
- **Watches** BTC/USD
- **Acts** at 1-minute increments (ticks)
- **Computes** the latest 14-hour [RSI](http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:relative_strength_index_rsi)

#HSLIDE

- **Considers** [RSI](http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:relative_strength_index_rsi) `>= 70` an upwards trend and [RSI](http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:relative_strength_index_rsi) `<= 30` a downwards trend.
- <span style="color:lime">Buys</span> during upwards trend, <span style="color:red">sells</span> during downwards trend.
- **Trades** 95% of current balance, market price.

#HSLIDE

### And finally,

- **Holds** for 100+ minutes after a trade.

#HSLIDE

- Tweak the JS to trade on [Bitfinex](https://bitfinex.com), or trade ETH, or what have you!
- After tweaking `default_logic.js`, Use `zenbot sim` to check your strategy against historical trades.

#HSLIDE

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

- The data doesn't lie.
- ANN's can be mathematically and empirically verified.
- In various studies, **neural networks** significantly outperform traditional linear technical analysis.

#HSLIDE

- ANN's are not just for science geeks anymore.
- ANN's are just now becoming available for wide use in trading.
- The Golden Age of AI and crypto currency only comes once. Enjoy it!

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

#VSLIDE

## Donate

- Zenbot is a hobby/passion project.
- Support Zenbot by donating Bitcoin to this QR code:

![bitcoin address](https://s8f.org/files/bitcoin.png)

#HSLIDE

> "Down with humans! LOL" -Zenbot
