# zenbot

# !ALPHA SOFTWARE. DO NOT USE FOR REAL TRADES.

zenbot is a passive trading bot for [GDAX](https://gdax.com/). zen trusts other bots and people.

## Usage

Configure it first in [conf/_codemap.js](https://github.com/carlos8f/zenbot/blob/master/conf/_codemap.js)

## record trades

```
$ npm install
$ node recorder.js
```

## backfill trades

```
$ node backfiller.js
```

### run trade simulation

```
$ node bot.js
```

### run trade bot and do ACTUAL trades (zen mode)

```
$ node bot.js --real
```
