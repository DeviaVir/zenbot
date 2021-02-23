# Zenbot Tips for GDAX

The following tips can increase reliability in using Zenbot with GDAX (Coinbase Pro).

## Sandbox
A public sandbox is available for testing API connectivity and web trading. While the sandbox only hosts a subset of the production order books, all of the exchange functionality is available. Additionally, in this environment you are allowed to add unlimited fake funds for testing.

Adjust the config file to enable (true) or disable (false) the use of the sandbox. Ensure the correct API credentials (live or sandbox) are inputted in the config file - otherwise you will recieve an API error. Additionally you will not use the --paper option since it will be conducting (simulated) trades in the sandbox. 

The default setting is set to false.

Example of the Sandbox enabled:
```
c.gdax.sandbox = process.env.ZENBOT_GDAX_SANDBOX || true
```

## Fee Limits

GDAX (Coinbase Pro) uses a maker-taker fee model for determining its trading fees. Orders that provide liquidity (maker orders) are charged different fees than orders that take liquidity (taker orders). Fees are calculated based on the current pricing tier you are in when the order is placed, and not on the tier you would be in after a trade is completed.

See your GDAX (Coinbase Pro) fees here - https://pro.coinbase.com/orders/fees.

To adjust the fee limits to match your current pricing tier, modifiy the following javascript file. 

```
extensions/exchanges/gdax/exchange.js
```

Look for this line:
```
  var exchange = {
    name: 'gdax',
    historyScan: 'backward',
    makerFee: 0.35,
    takerFee: 0.35,
    backfillRateLimit: 335,
```

Adjust the makerFee and takerFee, for example:
```
  var exchange = {
    name: 'gdax',
    historyScan: 'backward',
    makerFee: 0.5,
    takerFee: 0.5,
    backfillRateLimit: 335,
```
