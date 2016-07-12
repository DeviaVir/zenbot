# zenbot

- Follow zenbot [on Twitter!](https://twitter.com/zenbot_btc)
- Check out zenbot's [live feed!](https://zenbot.s8f.org/)
- Join the discussion on [Reddit!](https://www.reddit.com/r/Bitcoin/comments/4rym6o/zenbot_an_automated_bitcoin_trading_bot_for_gdax/)

![zenbot logo](https://raw.githubusercontent.com/carlos8f/zenbot/master/assets/zenbot_square.png)

> “To follow the path, look to the master, follow the master, walk with the master, see through the master, become the master.”
> – Zen Proverb

## Screenshot

![screenshot](https://cloud.githubusercontent.com/assets/106763/16441892/e791744c-3d82-11e6-834e-b566d498e7e9.png)

zenbot is an automated Bitcoin trading bot for [GDAX](https://gdax.com/). Its strategy is powered by a distributed [Artificial neural network](https://en.wikipedia.org/wiki/Technical_analysis#Systematic_trading) (ANN) which simulates on historical data and evolves the input parameters. It runs on node.js and MongoDB and is fully open-sourced.

zenbot follows a couple human-made rules:

1. decisions based on net trade volume of the dominant "taker" side
2. trade only at market value

The rest of the trading strategy is based on machine-learning and historical analysis, which you can run yourself to discover better strategies. It has full console graphing/indicators to show its reasoning when making decisions.

Since zenbot discovers its own best parameters based on marked data, you don't have to be a savvy trader to use it.

- Out of the box, zenbot is an AI-powered trade advisor (gives you buy or sell signals while watching live data)
- Give it a virtual balance, and zenbot will simulate on historical data and give you an ROI figure.
- Give it some time, and zenbot will learn how to improve the ROI through tweaking the trade parameters.
- Give it an API key, and zenbot will actually perform trades!

HOWEVER. BE AWARE that once you hook up zenbot to a live exchange, the damage done is your fault, not mine! **As with buying bitcoin in general, risk is involved and caution is essential. bitcoin is an experiment, and so is zenbot.**

## "following the path": zenbot's core logic

zenbot's logic is pretty open-ended. briefly:

- ticks are in 10s increments
- each tick is categorized as "buy" or "sell" based on if the trades consisted mostly of buying or selling (this is called the "taker" side, the opposite side of "maker" which was on the books)
- buying increments the **volume counter** in the positive direction, selling in the negative. each side is independently weighted (machine learned), allowing the bot to be "bullish" or "bearish".
- a **small decay** factor (machine-learned) is applied to the counter to weight recent events higher
- when the volume in one direction reaches a **trigger value** (machine learned), the bot gets ready to trade. for example, if `sell_volume - buy_volume > 750`, trigger to sell. amount to trade out of available balance is machine-learned.
- the volume counter is then **reset** at 0 and the cycle repeats

as you can see, zenbot completely ignores price. it also ignores volume that is cancelled out by the other side, for example a day-trader selling 20BTC and then buying it back immediately, to bait price swings. it does this under the belief that price is mostly an illusion, a result of directly preceding events, and those patterns tend to repeat, signalled by volume changes. thus, all params are based on historical analysis (typically the last 3 months of data) of volume, not price.

**TLDR;** so basically it filters out market noise, determines the best action from the traders themselves, and benefits by being among the first to detect these trends.

## How does this method fare when backtested on real data?

Current simulation results: zenbot started with $1,000 on 4/13/2016, 05:00:00 PM PDT, and ended with $1,923.53 on 7/6/2016, 04:59:30 PM PDT, or **92% return**. Here's the sim output: https://gist.github.com/carlos8f/0a73f27c5dd28ed39e67867a76f852f9

## the ZMI "zen market index" rating

zenbot generates a "zen market index" for every tick. For example,

`36/750 BULL`

...which means zen is **4% the way to buying**. Since this index has a decay applied, it's weighted to recent events and gives a decent at-a-glance mood of the system. You can check the **live ZMI** at https://zenbot.s8f.org/

## Install

Prereqs: [nodejs](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/)

```
$ git clone https://github.com/carlos8f/zenbot.git && cd zenbot
$ npm install && npm link
$ cp config-sample.js config.js
$ (edit config.js with api key)
$ zenbot

  Usage: zenbot [options] [command]


  Commands:

    record [options]     1. run the recorder
    backfill [options]   2. run the backfiller
    learn [options]      3. run the machine learner
    mem                  (optional) show zenbot's memory
    forget [options]     (optional) forget learned stuff
    listen [options]     (optional) listen for new strategies, and expose web console
    sim [options]        (optional) run the simulator
    run [options]        4. run zenbot on the exchange

  Options:

    -h, --help     output usage information
    --silent       speak no evil
    -V, --version  output the version number
```

## Getting Started

Coming soon: I will publish a step-by-step guide to get started with zenbot.

## Live Feed

zenbot has a live web console [here](https://zenbot.s8f.org/).

## FAQ

### Can I use zenbot with [X] exchange?

Currently zenbot only supports a single exchange (GDAX). This is mainly because the machine learning tunes itself to the exchange's specific volume levels, and GDAX's volume is on the low/predictable side. As I plan the next version of zenbot (3.x), I will consider adding other exchanges and averaging out the volume, possibly even with a bittorrent/swarm p2p setup so instances of zenbot can share computing power. This may result in less accurate, but more universal predictions.

### Why open source?

There is a general lack of open source bots, especially ones with AI. Since I learned how to code by reverse engineering, I publish code so others can do the same, and by doing so I'm saying thanks to Satoshi, Torvalds, djb, et. al for devoting their lives to open source. It might be against my "selfish interest" but in the end it's best for everyone. Plus, I still own the copyright.

### Were there any incidents when the bot's trade made a loss?

I have seen losses in the simulator, so it's possible. It only takes a few hours of machine learning to gain a comfortable (albeit virtual) profit margin though. If the bot starts losing money, you can always step in and manual trade or shut the bot down to prevent more loss.

### Based on what criteria does the bot decide to close a trade?

zenbot always trades with the "market" flag, i.e. the order never goes on the books, and the trade goes through with whatever price the last system trade was at. This way, zenbot never needs to cancel orders or compare prices.

### What does [bot] not enough currency to buy! mean?

It means the bot tried to buy BTC, but had not enough USD balance to do that. The volume counter resets anyway. If you feel comfortable investing, you can deposit USD in your GDAX account and zenbot will use that the next time the volume counter triggers.

## Systematic trading using neural networks

In mathematical terms, Artificial neural networks (ANNs) are universal function approximators, meaning that given the right data and configured correctly, they can capture and model any input-output relationships. This removes the need for human interpretation of charts to determine entry/exit signals.

As ANNs are essentially non-linear statistical models, their accuracy and prediction capabilities can be both mathematically and empirically tested. In various studies, authors have claimed that neural networks used for generating trading signals given various technical and fundamental inputs have significantly outperformed buy-hold strategies as well as traditional linear technical analysis methods when combined with rule-based expert systems.

While the advanced mathematical nature of such adaptive systems has kept neural networks for financial analysis mostly within academic research circles, in recent years more user friendly neural network software has made the technology more accessible to traders.

Source: [Wikipedia](https://en.wikipedia.org/wiki/Technical_analysis#Systematic_trading)

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

