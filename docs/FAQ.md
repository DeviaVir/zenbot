## Frequently Asked Questions

Here are a few questions that have been asked often as well as answers from the community.

If you have a question that is not answered here, feel free to ask in the Discord chat and suggest it to be placed here.

Thanks!

[Will I make money with Zenbot?](#money)

[Is Docker necessary when installing Zenbot?](#docker)

[Why do simulations, paper trading, and live trading all yield different results?](#sim-live-differences)
[Why should I use simulations or paper trading if they do not reflect live trading?](#why-sim)

[Why does Zenbot only use Limit orders?](#limit)
[Will Zenbot ever support Market orders?](#market-orders)

[Is there a community to get involved with Zenbot?](#community)

Errors
[Why do I keep getting a this "Nonce" error?](#error-1)


** Will I make money with Zenbot? ** <a name="money"></a>

That depends… a lot. Different configurations and strategies will yield different results.

The current default config and parameters will likely lose you money, so proceed with caution. Try running simulations and paper trading first to see how the bot acts (see warning below).



** Is Docker necessary when installing Zenbot? ** <a name="docker"></a>

No, Docker is often not necessary to run Zenbot. It is often simpler to run Zenbot on a Linux machine (Ubuntu, CentOS, etc.) without Docker.

If running Zenbot on Windows, Docker may be needed.



** Why do simulations, paper trading, and live trading all yield different results? ** <a name="sim-live-differences"></a>

Simulations and paper trading almost always give overly optimistic results compared to live trading. This is because simulations and paper trading both make assumptions about when/if an order is filled.

Because Zenbot currently only supports Limit orders (which often lessen fees), there tends to be much more slippage (the difference between when the bot decides to buy and when it actually buys) in live trading. Due to this, live trading is almost always worse than sims and paper trading.

Also, remember that past results do not guarantee future returns.


** Why should I use simulations or paper trading if they do not reflect live trading? ** <a name="why-sim"></a>

Simulations are more optimistic than paper trading.
Paper trading is more optimistic than live trading.
Therefore, if a simulation does not yield good results, odds are that neither will paper trading or (by extension) live trading.



** Why does Zenbot only use Limit orders? ** <a name="limit"></a>

On most exchanges, Limit orders result in lower fees than Market orders. For instance, on GDAX there no fee for a Limit order trade compared to a 0.25% (BTC) or 0.3% (ETH & LTC) trade fee on a Market order.

Check your exchange for fees.



** Will Zenbot ever support Market orders? ** <a name="market-orders"></a>

The option to trade using Market orders may be added in the future.



** Is there a community to get involved with Zenbot? ** <a name="community"></a>

Of course! Check out our Discord channel: 

[![zenbot logo](https://rawgit.com/carlos8f/zenbot/master/assets/discord.png)](https://discord.gg/ZdAd2gP)

There is also a shared Google Doc spreadsheet containing community sim results and variable descriptions:
[Click here for the Google Sheet](https://docs.google.com/spreadsheets/d/1WjFKRUY4KpkdIJiA3RVvKqiyNkMe9xtgLSfYESFXk1g/edit#gid=70204991).

### Errors

** Why do I keep getting this "Nonce" error? How do I solve it? ** <a name="error-1"></a>

* Answer coming soon *