# zenbot

- Follow zenbot [on Twitter!](https://twitter.com/zenbot_btc)
- Check out zenbot's [live feed!](https://zenbot.s8f.org/)

![zenbot logo](https://raw.githubusercontent.com/carlos8f/zenbot/master/assets/zenbot_square.png)

> “To follow the path, look to the master, follow the master, walk with the master, see through the master, become the master.”
> – Zen Proverb

zenbot is an automated Bitcoin trading bot for [GDAX](https://gdax.com/).

zenbot follows a couple human-made rules:

1. decisions based on net trade volume of the dominant "taker" side
2. trade only at market value

The rest of the trading strategy is based on machine-learning and historical analysis, which you can run yourself to discover better strategies. It has full console graphing/indicators to show its reasoning when making decisions.

Since zenbot discovers its own best parameters based on marked data, you don't have to be a savvy trader to use it.

- Out of the box, zenbot is an AI-powered trade advisor (gives you buy or sell signals while watching live data)
- Give it a virtual balance, and zenbot will simulate on historical data and give you an ROI figure.
- Give it some time, and zenbot will learn how to improve the ROI through tweaking the trade parameters.
- Give it an API key, and zenbot will actually perform trades!

HOWEVER. BE AWARE that once you hook up zenbot to a live exchange, the damage done is your fault, not mine!

## Install

Prereqs: [nodejs](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/)

```
$ git clone git@github.com:carlos8f/zenbot.git && cd zenbot
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

## Screenshot

![screenshot](https://cloud.githubusercontent.com/assets/106763/16441892/e791744c-3d82-11e6-834e-b566d498e7e9.png)

## Live Feed

zenbot has a live web console [here](https://zenbot.s8f.org/).


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

