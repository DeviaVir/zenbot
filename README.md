# zenbot

# !ALPHA SOFTWARE. DO NOT USE FOR REAL TRADES.

zenbot is a passive Bitcoin trading bot for [GDAX](https://gdax.com/).

zen trusts the market and bases its decisions on volume triggers. it is "passive" because instead of doing its own analysis, it relies on the self-interest of other traders in the system.

## record trades

```
$ npm install -g zenbot
$ zenbot record --verbose
```

## backfill trades

```
$ zenbot backfill --verbose
```

## run trade simulation

```
$ zenbot sim --verbose
```

## run trade bot and do ACTUAL trades (zen mode)

Doesn't work yet.

```
$ zenbot zen --verbose
```
