# zenbot

> “To follow the path, look to the master, follow the master, walk with the master, see through the master, become the master.”
> – Zen Proverb

## Disclaimer

USE AT YOUR OWN RISK.

END DISCLAIMER!

## Description

zenbot is a passive Bitcoin trading bot for [GDAX](https://gdax.com/).

zen trusts the market and bases its decisions on volume triggers. it is "passive" because instead of doing its own analysis, it relies on the self-interest of other traders in the system. it has full console graphing/indicators to show its reasoning when making decisions.

since it has no specific strategy, it requires no configuration besides your API key.

HOWEVER. BE AWARE that once you hook up zenbot to a live exchange, the damage done is your fault, not mine!

## Install

```
$ git clone git@github.com:carlos8f/zenbot.git && cd zenbot
$ npm install && npm link
$ cp gdax-config-sample.js gdax-config.js
$ (edit gdax-config.js with api key)
$ zenbot

  Usage: zenbot [options] [command]


  Commands:

    run [options]        run zenbot on the exchange (must run recorder also)
    sim [options]        run the simulator (must run backfiller first)
    backfill [options]   run the backfiller
    record [options]     run the recorder
    *

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```

## Screenshot

![screenshot](https://cloud.githubusercontent.com/assets/106763/16441892/e791744c-3d82-11e6-834e-b566d498e7e9.png)

## Commands

###record trades

```
$ zenbot record
```

### backfill trades

```
$ zenbot backfill
```

### run trade simulation on backfilled/recorded data

```
$ zenbot sim
```

### run trade bot on the exchange

```
$ zenbot run [--trade]
```

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
