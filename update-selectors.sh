#!/bin/bash

node ./zenbot.sh backfill bitfinex.ETH-USD --days 365
node ./zenbot.sh backfill bitfinex.BTC-USD --days 365
node ./zenbot.sh backfill bitfinex.ETH-BTC --days 365
node ./zenbot.sh backfill bitfinex.LTC-USD --days 365
node ./zenbot.sh backfill bitfinex.XRP-USD --days 365

node ./zenbot.sh backfill kraken.XETH-ZCAD --days 365
node ./zenbot.sh backfill kraken.XETH-ZUSD --days 365
node ./zenbot.sh backfill kraken.XXBT-ZCAD --days 365
node ./zenbot.sh backfill kraken.XXBT-ZCAD --days 365
node ./zenbot.sh backfill kraken.XETH-XXBT --days 365
