# Frequently Asked Questions

Here are a few questions that have been asked often as well as answers from the community.

If you have a question that is not answered here, feel free to ask in the [Reddit](#is-there-a-community-to-get-involved-with-zenbot) community and suggest it to be placed here.

Thanks!



## Contents

### [General](#general-1)
* [Is there a community to get involved with Zenbot?](#is-there-a-community-to-get-involved-with-zenbot)

### [Trading](#trading-1)
* [Will I make money with Zenbot?](#will-i-make-money-with-zenbot)
* [Why do simulations, paper trading, and live trading all yield different results?](#why-do-simulations-paper-trading-and-live-trading-all-yield-different-results)
* [Why should I use simulations or paper trading if they do not reflect live trading?](#why-should-i-use-simulations-or-paper-trading-if-they-do-not-reflect-live-trading)
* [Does Zenbot use Limit (maker) orders or Market (taker) orders?](#does-zenbot-use-limit-maker-orders-or-market-taker-orders)

### [Technical](#technical-1)
* [Can I install Zenbot on Windows?](#can-i-install-zenbot-on-windows)
* [Is Docker necessary when installing Zenbot?](#is-docker-necessary-when-installing-zenbot)
* [How do I launch Zenbot?](#how-do-i-launch-zenbot)
* [How do I update Zenbot?](#how-do-i-update-zenbot)

### [Errors](#errors-1)
* [Why do I keep getting a "Nonce" error?](#why-do-i-keep-getting-a-nonce-error)
* [Why do I keep getting a "JavaScript heap out of memory" error](#why-do-i-keep-getting-a-javascript-heap-out-of-memory-error)


## Answers

### General

#### Is there a community to get involved with Zenbot?

Of course! Check out our Reddit community ([subreddit zenbot](https://reddit.com/r/zenbot)).

There is also [a shared Google Docs spreadsheet containing community sim results and variable descriptions](https://docs.google.com/spreadsheets/d/1WjFKRUY4KpkdIJiA3RVvKqiyNkMe9xtgLSfYESFXk1g/edit#gid=70204991).



### Trading

#### Will I make money with Zenbot?

That depends… Different configurations and strategies will yield different results.

The current default config and parameters will likely lose you money, so proceed with caution. Try running simulations and paper trading first to see how the bot acts (see warning below).



#### Why do simulations, paper trading, and live trading all yield different results?

Simulations and paper trading almost always give overly optimistic results compared to live trading. This is because simulations and paper trading both make assumptions about when/if an order is filled.

Because Zenbot defaults to using Limit orders (which often lessen fees), there tends to be much more slippage (the difference between when the bot decides to buy and when it actually buys) in live trading. Due to this, live trading is almost always worse than sims and paper trading.

Also, remember that past results do not guarantee future returns.



#### Why should I use simulations or paper trading if they do not reflect live trading?

Simulations are more optimistic than paper trading.
Paper trading is more optimistic than live trading.
Therefore, if a simulation does not yield good results, odds are that neither will paper trading or (by extension) live trading.



#### Does Zenbot use Limit (maker) orders or Market (taker) orders?

Zenbot uses Limit orders by default because on most exchanges, Limit orders result in lower fees than Market orders. For instance, on GDAX there is no fee for a Limit order trade compared to a 0.25% (BTC) or 0.3% (ETH & LTC) trade fee on a Market order.

Check your exchange for fees.



### Technical

#### Can I install Zenbot on Windows?

Yes, Zenbot can be installed on Windows, although it is recommended that Linux or macOS is used instead.

Please note that these instructions are for Windows 10.

1. Install the "Bash on Windows subsystem" (see https://msdn.microsoft.com/en-us/commandline/wsl/about for more information)

> Note: You can then choose between Ubuntu, Fedora and OpenSUSE in the Windows store.

2. Open a terminal window, your disks will now be mounted under `/mnt/*`. So for example navigate to your directory (example: `cd /mnt/c/zenbot`)

3. Install node (`curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -; sudo apt-get install nodejs`)

4. Run zenbot as you would otherwise

> Note: MongoDB is not working in this subsystem, please use the Windows version!



#### Is Docker necessary when installing Zenbot?

No, Docker is often not necessary to run Zenbot. It is often simpler to run Zenbot on a Linux machine (Debian, CentOS, etc.) without Docker.

If running Zenbot on Windows, Docker may be needed.



#### How do I launch Zenbot?

After installation, you lauch Zenbot via command line.
Examples:
```
./zenbot.sh backfill gdax.ETH-BTC
./zenbot.sh sim gdax.ETH-BTC --days=14
zenbot sim --days 14
```
You can [generate a command with this shared Google Docs spreadsheet](https://docs.google.com/spreadsheets/d/1HECEHW-I9Evve_FQV3LT_IWGV6FU34tHif9TEouKtfg/edit?usp=sharing).
Do not hesitate to copy this file to your Google drive or download it as an spreadsheet, as everybody can modify it simultaneously.



#### How do I update Zenbot?

Without Docker:
```
git pull
npm install
./zenbot.sh trade --paper
```

With Docker:
```
git pull
docker-compose down
docker rmi zenbot_server
docker-compose build
docker-compose up -d
```



### Errors

#### Why do I keep getting a "Nonce" error?

This error may occur when multiple instances of Zenbot are used with the same API key. To avoid this, use a different API key for each concurrent instance of Zenbot.

This could also occur if the Zenbot server's time is not correct. Using NTP will keep the time current and help avoid this error.

#### Why do I keep getting a "JavaScript heap out of memory" error

This error may occur when your node environment does not have enough memory.

Solution (Linux & Docker): Change the line

`env node zenbot.js $@`

in [zenbot.sh](../zenbot.sh) to 

`env node --max-old-space-size=<memory> zenbot.js $@`

 where `<memory>` is the amount of memory node is allowed to use (e.g. 4096 for 4GB). For Windows you have to change the file [zenbot.bat](../zenbot.bat) respectively.
