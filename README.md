# zenbot

# !ALPHA SOFTWARE. DO NOT USE FOR REAL TRADES.

zenbot is a passive trading bot for [GDAX](https://gdax.com/). zen trusts the market and bases its decisions on volume triggers. it is "passive" because instead of doing its own analysis, it relies on the self-interest of other traders in the system.

## Usage

Configure it first in [conf/_codemap.js](https://github.com/carlos8f/zenbot/blob/master/conf/_codemap.js)

## record trades

```
$ npm install -g zenbot
$ zenbot record --verbose
```

## backfill trades

```
$ zenbot backfill --verbose
```

### run trade simulation

```
$ zenbot sim --verbose
```

### run trade bot and do ACTUAL trades (zen mode)

```
$ zenbot zen --verbose
```
