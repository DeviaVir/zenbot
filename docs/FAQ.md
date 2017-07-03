## Frequently Asked Questions

Here are a few questions that have been asked often as well as answers from the community.

If you have a question that is not answered here, feel free to ask in the [Discord](#community) chat and suggest it to be placed here.

Thanks!


### Contents

* [Will I make money with Zenbot?](#money)
* [Is Docker necessary when installing Zenbot?](#docker)
* [Why do simulations, paper trading, and live trading all yield different results?](#sim-live-differences)
* [Why should I use simulations or paper trading if they do not reflect live trading?](#why-sim)
* [How do I launch Zenbot?](#commands)
* [Does Zenbot use Limit orders or Market orders?](#limit-market-orders)
* [Is there a community to get involved with Zenbot?](#community)
* [Can I install Zenbot on Windows?](#windows)
* [How do I update Zenbot?](#update)
* [Why do I keep getting a this "Nonce" error?](#error-1)



**Will I make money with Zenbot?** <a name="money"></a>

That depends… Different configurations and strategies will yield different results.

The current default config and parameters will likely lose you money, so proceed with caution. Try running simulations and paper trading first to see how the bot acts (see warning below).



**Is Docker necessary when installing Zenbot?** <a name="docker"></a>

No, Docker is often not necessary to run Zenbot. It is often simpler to run Zenbot on a Linux machine (Ubuntu, CentOS, etc.) without Docker.

If running Zenbot on Windows, Docker may be needed.



**Why do simulations, paper trading, and live trading all yield different results?** <a name="sim-live-differences"></a>

Simulations and paper trading almost always give overly optimistic results compared to live trading. This is because simulations and paper trading both make assumptions about when/if an order is filled.

Because Zenbot defaults to using Limit orders (which often lessen fees), there tends to be much more slippage (the difference between when the bot decides to buy and when it actually buys) in live trading. Due to this, live trading is almost always worse than sims and paper trading.

Also, remember that past results do not guarantee future returns.



**Why should I use simulations or paper trading if they do not reflect live trading?** <a name="why-sim"></a>

Simulations are more optimistic than paper trading.
Paper trading is more optimistic than live trading.
Therefore, if a simulation does not yield good results, odds are that neither will paper trading or (by extension) live trading.


**How do I launch Zenbot?** <a name="commands"></a>

After installation, you lauch Zenbot via command line.
Example:
```
./zenbot.sh backfill gdax.ETH-BTC
./zenbot.sh sim gdax.ETH-BTC --days=14 or zenbot sim --days 14 
```
[You can generate a command with this google spreadsheet](https://docs.google.com/spreadsheets/d/1HECEHW-I9Evve_FQV3LT_IWGV6FU34tHif9TEouKtfg/edit?usp=sharing).
Do not hesitate to copy this file to your Google drive or download it as an Excel file, as everybody can modify it simultaneously.


**Why does Zenbot use Limit orders by default?** <a name="limit-market-orders"></a>

On most exchanges, Limit orders result in lower fees than Market orders. For instance, on GDAX there is no fee for a Limit order trade compared to a 0.25% (BTC) or 0.3% (ETH & LTC) trade fee on a Market order.

Check your exchange for fees.



**Is there a community to get involved with Zenbot?** <a name="community"></a>

Of course! Check out our Discord channel: 

[![zenbot logo](https://rawgit.com/carlos8f/zenbot/master/assets/discord.png)](https://discord.gg/ZdAd2gP)

There is also a shared Google Doc spreadsheet containing community sim results and variable descriptions:
[Click here for the Google Sheet](https://docs.google.com/spreadsheets/d/1WjFKRUY4KpkdIJiA3RVvKqiyNkMe9xtgLSfYESFXk1g/edit#gid=70204991).



**Can I install Zenbot on Windows?** <a name="windows"></a>

Yes, Zenbot can be installed on Windows, although it is recommended that Linux or macOS is used instead.

To install Zenbot on Windows:

1. Install the "Bash on Windows subsystem" (see https://msdn.microsoft.com/en-us/commandline/wsl/about for more information)

> Note: This will change soon, seeing that Microsoft decided to have Ubuntu, Fedora and OpenSUSE available. They will also drop the requirement for requiring dev mode enabled on windows soon. Source: https://blogs.msdn.microsoft.com/commandline/2017/05/11/new-distros-coming-to-bashwsl-via-windows-store/ and https://blogs.msdn.microsoft.com/commandline/2017/06/08/developer-mode-no-longer-required-for-windows-subsystem-for-linux/

2. Open the terminal window, your disks will now be mounted under `/mnt/*`. So for example navigate to your directory (example: `cd /mnt/c/zenbot`)

3. Install node (`curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -; sudo apt-get install nodejs`)

4. Run zenbot as you would otherwise



**How do I update Zenbot?** <a name="update"></a>

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

**Why do I keep getting this "Nonce" error? How do I solve it?** <a name="error-1"></a>

This error may occur when multiple instances of Zenbot are used with the same API key. To avoid this, use a different API key for each concurrent instance of Zenbot.

This could also occur if the Zenbot server's time is not correct. Using NTP will keep the time current and help avoid this error.
