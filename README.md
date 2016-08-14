# zenbot 3

![zenbot logo](https://rawgit.com/carlos8f/zenbot/3.x/assets/zenbot_clean.png)

> “To follow the path, look to the master, follow the master, walk with the master, see through the master, become the master.”
> – Zen Proverb

- Follow zenbot [on Twitter!](https://twitter.com/zenbot_btc)
- Check out zenbot's [live feed!](https://zenbot.s8f.org/)
- Join the discussion on [Reddit!](https://www.reddit.com/r/Bitcoin/comments/4rym6o/zenbot_an_automated_bitcoin_trading_bot_for_gdax/)

## Description

zenbot is an automated cryptocurrency trading bot. It runs on node.js and MongoDB and is fully open-sourced. A plugin architecture is included that allows any exchange, trade strategy, or currency pair to be supported.

- Out of the box, zenbot is an AI-powered trade advisor for GDAX (gives you buy or sell signals while watching live data).
- Enable trades by simply giving it your GDAX API key.
- Trade strategy is exposed in the config file. This allows you to have full control over the bot's actions and logic.
- A live candlestick graph is provided via a built-in HTTP server.

HOWEVER. BE AWARE that once you hook up zenbot to a live exchange, the damage done is your fault, not mine! **As with buying bitcoin in general, risk is involved and caution is essential. bitcoin is an experiment, and so is zenbot.**

## Screenshot

![screenshot](https://rawgit.com/carlos8f/zenbot/3.x/assets/zenbot_web_ui.png)

## Quick-start

1. Requirements: [Node.js](https://nodejs.org/) and [MongoDB](https://mongodb.org/)

2. Install zenbot 3:

```shell
curl --silent https://raw.githubusercontent.com/carlos8f/zenbot/master/install.sh | /bin/sh
```

3. Edit `zenbot/config.js` with API keys, database credentials, trade logic, etc.

4. Run zenbot on the exchange:

```shell
./run.sh
```

5. Open the live graph URL provided in the console.

To access the CLI,

```shell
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

## Simulation

Run a simulation on backfilled/recorded data by running:

```shell
zenbot sim
```

Zenbot will return you a list of virtual trades, and an ROI figure. Open the URL provided in the console (while running the server) to see the virtual trades plotted on a candlestick graph.

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

It means the bot tried to buy BTC, but had not enough USD balance to do that. The volume counter resets anyway. If you feel comfortable investing, you can deposit USD in your GDAX account and zenbot will use that the next time the trade signal triggers.

## Reading assignment: Systematic trading using neural networks

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

