![zenbot logo](https://rawgit.com/deviavir/zenbot/master/assets/logo.png)

> “To follow the path, look to the master, follow the master, walk with the master, see through the master, become the master.”
> – Zen Proverb

# Zenbot [![Build/Test Status](https://travis-ci.org/DeviaVir/zenbot.svg?branch=master)](https://travis-ci.org/DeviaVir/zenbot) [![Greenkeeper badge](https://badges.greenkeeper.io/DeviaVir/zenbot.svg)](https://greenkeeper.io/)

## Description

Zenbot is a command-line cryptocurrency trading bot using Node.js and MongoDB. It features:

- Fully-automated [technical-analysis](http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:introduction_to_technical_indicators_and_oscillators)-based trading approach
- Full support for [GDAX](https://gdax.com/), [Poloniex](https://poloniex.com), [Kraken](https://kraken.com/), [Bittrex](https://bittrex.com/), [Quadriga](https://www.quadrigacs.com), [Gemini](https://www.gemini.com), [Bitfinex](https://www.bitfinex.com), [CEX.IO](https://cex.io/trade) and [Bitstamp](https://www.bitstamp.net/), work on further exchange support is ongoing.
- Plugin architecture for implementing exchange support, or writing new strategies
- Simulator for [Backtesting strategies](https://gist.github.com/carlos8f/b09a734cf626ffb9bb3bcb1ca35f3db4) against historical data
- "Paper" trading mode, operates on a simulated balance while watching the live market
- Configurable sell stops, buy stops, and (trailing) profit stops
- Flexible sampling period and trade frequency - averages 1-2 trades/day with 1h period, 15-50/day with 5m period

## Disclaimer

- Zenbot is NOT a sure-fire profit machine. Use it AT YOUR OWN RISK.
- Crypto-currency is still an experiment, and therefore so is Zenbot. Meaning, both may fail at any time.
- Running a bot, and trading in general requires careful study of the risks and parameters involved. A wrong setting can cause you a major loss.
- Never leave the bot un-monitored for long periods of time. Zenbot doesn't know when to stop, so be prepared to stop it if too much loss occurs.
- Often times the default trade parameters will underperform vs. a buy-hold strategy, so run some simulations and find the optimal parameters for your chosen exchange/pair before going "all-in".

## Questions

First read on at the [docs](docs/README.md) and there are also [FAQs](FAQ.md) which may answer your questions.
Please ask (programming) questions related to zenbot on reddit. The subreddit is [zenbot](https://reddit.com/r/zenbot).

### Community

Join the Zenbot community on [Reddit](https://reddit.com/r/zenbot)!

## Donate

P.S., some have asked for how to donate to Zenbot development. We accept donations at **Bitcoin addresses** below:

### carlos8f's BTC (original zenbot author)

`187rmNSkSvehgcKpBunre6a5wA5hQQop6W`

### DeviaVir's BTC (current maintainer)

`3A5g4GQ2vmjNcnEschCweJJB4umzu66sdY`

![zenbot logo](https://rawgit.com/deviavir/zenbot/master/assets/zenbot_square.png)

Thanks!

## Noteworthy forks

- [bot18](https://medium.com/@carlos8f_11468/introducing-bot18-the-new-crypto-trading-bot-to-supersede-zenbot-and-unleash-the-zalgo-da8464b41e53)
- [magic8bot](https://github.com/notVitaliy/magic8bot)

- - -

### License: MIT

- Copyright (C) 2018 Carlos Rodriguez
- Copyright (C) 2018 Terra Eclipse, Inc. (http://www.terraeclipse.com/)

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
