![zenbot logo](Capture.PNG)

```sudo ./zenbot.sh sim --strategy=trendline --period=1s --min_periods=15000 --days=14 poloniex.BCN-BTC```

### Ubuntu 16.04 Step-By-Step
https://youtu.be/BEhU55W9pBI
```
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install build-essential mongodb -y

curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs

git clone https://github.com/carlos8f/zenbot.git
cd zenbot
npm install

./zenbot.sh trade --paper
```
## Selectors

A "selector" is a short identifier that tells Zenbot which exchange and currency pair to act on. Use the form `{exchange_slug}.{asset}-{currency}`. A complete list of selectors your Zenbot install supports can be found with:

```
zenbot list-selectors

poloniex:
  poloniex.AMP-BTC   (Synereo AMP/Bitcoin)
  poloniex.ARDR-BTC   (Ardor/Bitcoin)
  poloniex.BCH-BTC   (Bitcoin Cash/Bitcoin)
  poloniex.BCH-ETH   (Bitcoin Cash/Ethereum)
  poloniex.BCH-USDT   (Bitcoin Cash/Tether USD)
  poloniex.BCN-BTC   (Bytecoin/Bitcoin)
  poloniex.BCN-XMR   (Bytecoin/Monero)
  poloniex.BCY-BTC   (BitCrystals/Bitcoin)
  poloniex.BELA-BTC   (Bela/Bitcoin)
  poloniex.BLK-BTC   (BlackCoin/Bitcoin)
  poloniex.BLK-XMR   (BlackCoin/Monero)
  poloniex.BTC-USDT   (Bitcoin/Tether USD)
  poloniex.BTCD-BTC   (BitcoinDark/Bitcoin)
  poloniex.BTCD-XMR   (BitcoinDark/Monero)
  poloniex.BTM-BTC   (Bitmark/Bitcoin)
  poloniex.BTS-BTC   (BitShares/Bitcoin)
  poloniex.BURST-BTC   (Burst/Bitcoin)
  poloniex.CLAM-BTC   (CLAMS/Bitcoin)
  poloniex.CVC-BTC   (Civic/Bitcoin)
  poloniex.CVC-ETH   (Civic/Ethereum)
  poloniex.DASH-BTC   (Dash/Bitcoin)
  poloniex.DASH-USDT   (Dash/Tether USD)
  poloniex.DASH-XMR   (Dash/Monero)
  poloniex.DCR-BTC   (Decred/Bitcoin)
  poloniex.DGB-BTC   (DigiByte/Bitcoin)
  poloniex.DOGE-BTC   (Dogecoin/Bitcoin)
  poloniex.EMC2-BTC   (Einsteinium/Bitcoin)
  poloniex.ETC-BTC   (Ethereum Classic/Bitcoin)
  poloniex.ETC-ETH   (Ethereum Classic/Ethereum)
  poloniex.ETC-USDT   (Ethereum Classic/Tether USD)
  poloniex.ETH-BTC   (Ethereum/Bitcoin)
  poloniex.ETH-USDT   (Ethereum/Tether USD)
  poloniex.EXP-BTC   (Expanse/Bitcoin)
  poloniex.FCT-BTC   (Factom/Bitcoin)
  poloniex.FLDC-BTC   (FoldingCoin/Bitcoin)
  poloniex.FLO-BTC   (Florincoin/Bitcoin)
  poloniex.GAME-BTC   (GameCredits/Bitcoin)
  poloniex.GAS-BTC   (Gas/Bitcoin)
  poloniex.GAS-ETH   (Gas/Ethereum)
  poloniex.GNO-BTC   (Gnosis/Bitcoin)
  poloniex.GNO-ETH   (Gnosis/Ethereum)
  poloniex.GNT-BTC   (Golem/Bitcoin)
  poloniex.GNT-ETH   (Golem/Ethereum)
  poloniex.GRC-BTC   (Gridcoin Research/Bitcoin)
  poloniex.HUC-BTC   (Huntercoin/Bitcoin)
  poloniex.LBC-BTC   (LBRY Credits/Bitcoin)
  poloniex.LSK-BTC   (Lisk/Bitcoin)
  poloniex.LSK-ETH   (Lisk/Ethereum)
  poloniex.LTC-BTC   (Litecoin/Bitcoin)
  poloniex.LTC-USDT   (Litecoin/Tether USD)
  poloniex.LTC-XMR   (Litecoin/Monero)
  poloniex.MAID-BTC   (MaidSafeCoin/Bitcoin)
  poloniex.MAID-XMR   (MaidSafeCoin/Monero)
  poloniex.NAV-BTC   (NAVCoin/Bitcoin)
  poloniex.NEOS-BTC   (Neoscoin/Bitcoin)
  poloniex.NMC-BTC   (Namecoin/Bitcoin)
  poloniex.NXC-BTC   (Nexium/Bitcoin)
  poloniex.NXT-BTC   (NXT/Bitcoin)
  poloniex.NXT-USDT   (NXT/Tether USD)
  poloniex.NXT-XMR   (NXT/Monero)
  poloniex.OMG-BTC   (OmiseGO/Bitcoin)
  poloniex.OMG-ETH   (OmiseGO/Ethereum)
  poloniex.OMNI-BTC   (Omni/Bitcoin)
  poloniex.PASC-BTC   (PascalCoin/Bitcoin)
  poloniex.PINK-BTC   (Pinkcoin/Bitcoin)
  poloniex.POT-BTC   (PotCoin/Bitcoin)
  poloniex.PPC-BTC   (Peercoin/Bitcoin)
  poloniex.RADS-BTC   (Radium/Bitcoin)
  poloniex.REP-BTC   (Augur/Bitcoin)
  poloniex.REP-ETH   (Augur/Ethereum)
  poloniex.REP-USDT   (Augur/Tether USD)
  poloniex.RIC-BTC   (Riecoin/Bitcoin)
  poloniex.SBD-BTC   (Steem Dollars/Bitcoin)
  poloniex.SC-BTC   (Siacoin/Bitcoin)
  poloniex.STEEM-BTC   (STEEM/Bitcoin)
  poloniex.STEEM-ETH   (STEEM/Ethereum)
  poloniex.STORJ-BTC   (Storj/Bitcoin)
  poloniex.STR-BTC   (Stellar/Bitcoin)
  poloniex.STR-USDT   (Stellar/Tether USD)
  poloniex.STRAT-BTC   (Stratis/Bitcoin)
  poloniex.SYS-BTC   (Syscoin/Bitcoin)
  poloniex.VIA-BTC   (Viacoin/Bitcoin)
  poloniex.VRC-BTC   (VeriCoin/Bitcoin)
  poloniex.VTC-BTC   (Vertcoin/Bitcoin)
  poloniex.XBC-BTC   (BitcoinPlus/Bitcoin)
  poloniex.XCP-BTC   (Counterparty/Bitcoin)
  poloniex.XEM-BTC   (NEM/Bitcoin)
  poloniex.XMR-BTC   (Monero/Bitcoin)
  poloniex.XMR-USDT   (Monero/Tether USD)
  poloniex.XPM-BTC   (Primecoin/Bitcoin)
  poloniex.XRP-BTC   (Ripple/Bitcoin)
  poloniex.XRP-USDT   (Ripple/Tether USD)
  poloniex.XVC-BTC   (Vcash/Bitcoin)
  poloniex.ZEC-BTC   (Zcash/Bitcoin)
  poloniex.ZEC-ETH   (Zcash/Ethereum)
  poloniex.ZEC-USDT   (Zcash/Tether USD)
  poloniex.ZEC-XMR   (Zcash/Monero)
  poloniex.ZRX-BTC   (0x/Bitcoin)
  poloniex.ZRX-ETH   (0x/Ethereum)
```

## Run a simulation for your selector

To backfill data (provided that your chosen exchange supports it), use:

```
zenbot backfill <selector> --days <days>
```

After you've backfilled, you can run a simulation:

```
zenbot sim <selector> [options]
```

For a list of options for the `sim` command, use:

```
zenbot sim --help

```

For additional options related to the strategy, use:

```
zenbot list-strategies
```

- By default the sim will start with 1000 units of currency. Override with `--currency_capital` and `--asset_capital`.
- Open `sim_result.html` in your browser to see a candlestick graph with trades.

### Screenshot and example result

Zenbot outputs an HTML graph of each simulation result. In the screenshot below, the pink arrows represent the bot buying (up arrow) and selling (down arrow) as it iterated the historical data of [GDAX](https://gdax.com/) exchange's BTC/USD product.

![screenshot](https://cloud.githubusercontent.com/assets/106763/25983930/7e5f9436-369c-11e7-971b-ba2916442eea.png)

```
end balance 2954.50 (195.45%)
buy hold 1834.44 (83.44%)
vs. buy hold 61.06%
110 trades over 91 days (avg 1.21 trades/day)
```

Zenbot started with $1,000 USD and ended with $2,954.50 after 90 days, making 195% ROI! In spite of a buy/hold strategy returning a respectable 83.44%, Zenbot has considerable potential for beating buy/holders.

- Note that this example used tweaked settings to achieve optimal return: `--profit_stop_enable_pct=10`, `--profit_stop_pct=4`, `--trend_ema=36`, and `--sell_rate=-0.006`. Default parameters yielded around 65% ROI.
- [Raw data](https://gist.github.com/carlos8f/b09a734cf626ffb9bb3bcb1ca35f3db4) from simulation

## Running zenbot

The following command will launch the bot, and if you haven't touched `c.selector` in `conf.js`, will trade the default BTC/USD pair on GDAX.

```
zenbot trade [--paper] [--manual]
```

Use the `--paper` flag to only perform simulated trades while watching the market.

Use the `--manual` flag to watch the price and account balance, but do not perform trades automatically.

Here's how to run a different selector (example: ETH-BTC on Poloniex):

```
zenbot trade poloniex.eth-btc
```

For a full list of options for the `trade` command, use:

```
zenbot trade --help

  Usage: trade [options] [selector]

  run trading bot against live market data

  Options:

    --conf <path>                   path to optional conf overrides file
    --strategy <name>               strategy to use
    --order_type <type>             order type to use (maker/taker)
    --paper                         use paper trading mode (no real trades will take place)
    --manual                        watch price and account balance, but do not perform trades automatically
    --currency_capital <amount>     for paper trading, amount of start capital in currency
    --asset_capital <amount>        for paper trading, amount of start capital in asset
    --avg_slippage_pct <pct>        avg. amount of slippage to apply to paper trades
    --buy_pct <pct>                 buy with this % of currency balance
    --sell_pct <pct>                sell with this % of asset balance
    --markdown_buy_pct <pct>        % to mark down buy price (previously the --markup_pct property)
    --markup_sell_pct <pct>         % to mark up sell price (previously the --markup_pct property)
    --order_adjust_time <ms>        adjust bid/ask on this interval to keep orders competitive
    --order_poll_time <ms>          poll order status on this interval
    --sell_stop_pct <pct>           sell if price drops below this % of bought price
    --buy_stop_pct <pct>            buy if price surges above this % of sold price
    --profit_stop_enable_pct <pct>  enable trailing sell stop when reaching this % profit
    --profit_stop_pct <pct>         maintain a trailing stop this % below the high-water mark of profit
    --max_sell_loss_pct <pct>       avoid selling at a loss pct under this float
    --max_slippage_pct <pct>        avoid selling at a slippage pct above this float
    --rsi_periods <periods>         number of periods to calculate RSI at
    --poll_trades <ms>              poll new trades at this interval in ms
    --disable_stats                 disable printing order stats
    --reset_profit                  start new profit calculation from 0
    --debug                         output detailed debug info
    -h, --help                      output usage information
```

and also:

```
zenbot list-strategies
trendline (default)
  description:
    Calculate a trendline and trade when trend is positive vs negative.
  options:
    --period=<value>  period length (default: 1s)
    --lastpoints=<value>  Number of trades for short trend average (default: 100)
    --avgpoints=<value>  Number of trades for long trend average (default: 1000)
    --lastpoints2=<value>  Number of trades for short trend average (default: 10)
    --avgpoints2=<value>  Number of trades for long trend average (default: 100)
    --min_periods=<value>  Basically avgpoints + a BUNCH of more preroll periods for anything less than 5s period (default: 5000)
    --markup_sell_pct=<value>  test (default: 0)
    --markdown_buy_pct=<value>  test (default: 0)

```
## Interactive controls

While the `trade` command is running, Zenbot will respond to these keypress commands:

- Pressing `b` will trigger a buy, `s` for sell, and `B` and `S` for market (taker) orders.
- Pressing `c` or `C` will cancel any active orders.
- Pressing `m` or `M` will toggle manual mode (`--manual`)

These commands can be used to override what the bot is doing. Or, while running with the `--manual` flag, this allows you to make all the trade decisions yourself.

## Conf/argument override files

To run `trade` or `sim` commands with a pre-defined set of options, use:

```
zenbot trade --conf <path>
```

Where `<path>` points to a JS file that exports an object hash that overrides any conf or argument variables. For example, this file will run gdax.ETH-USD with options specific for that market:

```
var c = module.exports = {}

// ETH settings (note: this is just an example, not necessarily recommended)
c.selector = 'gdax.ETH-USD'
c.period = '10m'
c.trend_ema = 20
c.neutral_rate = 0.1
c.oversold_rsi_periods = 20
c.max_slippage_pct = 10
c.order_adjust_time = 10000
```

## Reading the console output

![console](https://rawgit.com/carlos8f/zenbot/master/assets/console.png)

From left to right:

- Timestamp in local time (grey, blue when showing "live" stats)
- Asset price in currency (yellow)
- Percent change of price since last period (red/green)
- Volume in asset since last period (grey)
- [RSI](http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:relative_strength_index_rsi) ANSI graph (red/green)
- strategy inormation, in order:
```
- col1: trendline 10000/1000 trades 
- col2: trendline 1000/100 trades 
- col3:stdev of 10000 trades
- col4: stdev of 1000 trades
- col5: 10000trades mean
- col6: 1000 trades mean
- col7: the mean of the 10000 & 1000 trades and stdev calculated into 100* the stdev percentage of the mean of the long and short trades (in short the active-markup based on a multiplier of standard deviation.) 
- If the four cols on the right are green, that means its a currently increasing trend) when both on the left are green both trends are increasing)
```
- Current signal or action, including `buy`, `sell`, `buying`, `selling`, `bought`, `sold` and `last_trade_worth` (percent change in the trend direction since last buy/sell)
- Account balance (asset)
- Account balance (currency)
- Profit or loss percent (can be reset with `--reset_profit`)
- Gain or loss vs. buy/hold strategy

## Notifiers

Zenbot employs various notifiers to keep you up to date on the bot's actions. We currently send a notification on a buy and on a sell signal.

### pushbullet

Supply zenbot with your api key and device ID and we will send your notifications to your device.
https://www.pushbullet.com/

### Slack

Supply zenbot with a webhook URI and zenbot will push notifications to your webhook.
https://slack.com/

### XMPP

Supply zenbot with your XMPP credentials and zenbot will send notifications by connecting to your XMPP, sending the notification, and disconnecting.
https://xmpp.org/

### IFTTT

Supply zenbot with your IFTTT maker key and zenbot will push notifications to your IFTTT.
https://ifttt.com/maker_webhooks

### DISCORD

Supply zenbot with your Discord webhook id and webhook token zenbot will push notifications to your Discord channel.

How to add a webhook to a Discord channel
https://support.discordapp.com/hc/en-us/articles/228383668

### Prowl

Supply zenbot with your Prowl API key and zenbot will push notifications to your Prowl enabled devices.
https://www.prowlapp.com/

### TextBelt

Supply zenbot with your TextBelt API key and zenbot will send SMS notifications to your cell phone.
https://www.textbelt.com/

## Rest API

You can enable a Rest API for Zenbot by enabling the following configuration
```
c.output.api = {}
c.output.api.on = true
c.output.api.port = 0 // 0 = random port
```
You can choose a port, or pick 0 for a random port.

Once you did that, you can call the API on: http://\<hostname\>:\<port\>/trades

## Manual trade tools

Zenbot's order execution engine can also be used for manual trades. Benefits include:

- Avoids market-order fees by using a short-term limit order
- Can automatically determine order size from account balance
- Adjusts order every 30s (if needed) to ensure quick execution
- If an order is partially filled, attempts to re-order with remaining size

The command to buy is:

```
zenbot buy <selector> [--size=<size>] [--pct=<pct>]
```

For example, to use your remaining USD balance in GDAX to buy Bitcoin:

```
zenbot buy gdax.BTC-USD
```

Or to sell 10% of your BTC,

```
zenbot sell gdax.BTC-USD --pct=10
```

## Chat with other Zenbot users

[![zenbot logo](https://rawgit.com/carlos8f/zenbot/master/assets/discord.png)](https://discord.gg/ZdAd2gP)

Zenbot has a Discord chat! You can get in [through this invite link](https://discord.gg/ZdAd2gP).

## Donate

P.S., some have asked for how to donate to Zenbot development. I accept donations at **my Bitcoin address** Here:

### carlos8f's BTC

`187rmNSkSvehgcKpBunre6a5wA5hQQop6W`

![zenbot logo](https://rawgit.com/carlos8f/zenbot/master/assets/zenbot_square.png)

Thanks!

- - -

### License: MIT

- Copyright (C) 2017 Carlos Rodriguez
- Copyright (C) 2017 Terra Eclipse, Inc. (http://www.terraeclipse.com/)

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
