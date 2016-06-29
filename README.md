# zenbot

> “To follow the path, look to the master, follow the master, walk with the master, see through the master, become the master.”
> – Zen Proverb

zenbot is a passive Bitcoin trading bot for [GDAX](https://gdax.com/).

zen trusts the market and bases its decisions on volume triggers. it is "passive" because instead of doing its own analysis, it relies on the self-interest of other traders in the system. it has full console graphing/indicators to show its reasoning when making decisions.

![screenshot](https://cloud.githubusercontent.com/assets/106763/16441892/e791744c-3d82-11e6-834e-b566d498e7e9.png)

since it has no strategy, it requires no configuration besides your API key.

## record trades

```
$ npm install -g zenbot
$ zenbot record
```

## backfill trades

```
$ zenbot backfill
```

## run trade simulation on backfilled/recorded data

```
$ zenbot sim
```

## run trade bot on the exchange

```
$ zenbot run [--trade]
```
