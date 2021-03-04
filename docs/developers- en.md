## Zenbot exchange API
This document is written to help developers implement new extensions for Zenbot.

It is reverse engineered from inspecting the Zenbot files and the GDAX extension and is not a definitive guide for developing an extension.

Any contribution that makes this document better is certainly welcome.

The document is an attempt to describe the interface functions used for communication with an exchange and a few helper functions. Each function has a set of calling parameters and return values and statuses

The input parameters are packed in the "opts" object, and the results from invoking the function are returned in an object.

## Error handling

Errors are returned to calling program through a callback functon of this form:
```javascript
cb (err)
```
The expected content of "err" is as follows:
```javascript
  { code: 'HTTP_STATUS', body: body }
```

**Non recoverable errors** should be handled by the actual extension function. A typical error is "Page not found", which most likely is caused by a malformed URL. Such errors should return a descriptive message and force a program exit.

**Recoverable errors** affecting trades should be handled by zenbot, while others could be handled in the extension layer. This needs to be clarified.


Some named errors are already handled by the main program (see getTrades below). These are:
```
  'ETIMEDOUT', // possibly recoverable
  'ENOTFOUND', // not recoverable (404?)
  'ECONNRESET' // possibly recoverable
```
Zenbot may have some GDAX-specific code. In particular that pertains to return values from exchange functions. Return values in general should be handled in a exchange agnostic and standardized way to make it easiest possible to write extensions.

**Some variables in the "exchange" object are worth mentioning**
```
  name: 'some_exchange_name'
  historyScan: 'forward', 'backward' or false
  makerFee: exchange_maker_fee (numeric) // Set by a function if the exchange supports it
  takerFee: exchange_taker_fee (numeric) // Else set with a constant
  backfillRateLimit: some_value_fitting_exchange_policy or 0
```
## Functions

**Connecting to the exchange for public requests**
```javascript
funcion publicClient ()
```
Called from:
- extension/*/exchange.js

Returns a "client" object for use in exchange public access functions.

**Connecting and authenticating private requests**
```javascript
function authedClient ()
```
Called from:
- extension/*/exchange.js

The function gets parameters from conf.js in the c object
In particular these are:
```
  c.<exchange>.key
  c.<exchange>.secret
```
For specific exchanges also:
```
  c.bitstamp.client_id
  c.gdax.passphrase
```
The functionm returns a "client" object for use in exchange authenticated access functions

**Helper function for returning conformant error messages**
```javascript
function statusErr (resp, body)
```
Called from:
- extension/*/exchange.js

**Getting public history and trade data**
```javascript
getTrades: function (opts, cb)
```
Called from:
- https://github.com/carlos8f/zenbot/blob/master/commands/backfill.js
- https://github.com/carlos8f/zenbot/blob/master/commands/trade.js

Input:
```
  opts.product_id
  opts.from
  opts.to
```
Return:
```
  trades.length
  (array of?) {
    trade_id: some_id
    time: 'transaction_time',
    size: trade_size,
    price: trade_prize,
    side : 'buy' or 'sell'
  }
```
Expected error codes if error:
```
  err.code

  'ETIMEDOUT', // possibly recoverable
  'ENOTFOUND', // not recoverable
  'ECONNRESET' // possibly recoverable
```
Callback:
```javascript
cb(null, trades)
```

**Getting wallet balances**
```javascript
getBalance: function (opts, cb)
```
Called from:
- https://github.com/carlos8f/zenbot/blob/master/lib/engine.js

Input:
```
  opts.currency
  opts.asset
```
Return:
```
  balance.asset
  balance.asset_hold
  balance.currency
  balance.currency_hold
```
Callback:
```javascript
cb(null, balance)
```
Comment:
Asset vs asset_hold and currency vs currency_hold is kind of mysterious to me.
For most exchanges I would just return something similar to available_asset and available_currency
For exchanges that returns some other values, I would do the calculation on the extension layer
and not leave it to engine.js, because available_asset and available_currency are only interesting
values from a buy/sell view, IMHO. If someone knows better, please clarify

**Getting public ticker data**
```javascript
getQuote: function (opts, cb)
```
Called from:
- https://github.com/carlos8f/zenbot/blob/master/lib/engine.js
- https://github.com/carlos8f/zenbot/blob/master/commands/buy.js
- https://github.com/carlos8f/zenbot/blob/master/commands/sell.js

Input:
```
  opts.product_id
```
Return:
```
  {bid: value_of_bid, ask: value_of_ask}
```
Callback:
```javascript
cb(null, {bid: body.bid, ask: body.ask})
```

**Canceling a placed order**
```javascript
cancelOrder: function (opts, cb)
```
Called from:
- https://github.com/carlos8f/zenbot/blob/master/lib/engine.js

Input:
```
  opts.order_id
```
Callback:
```javascript
cb()
```

**Buying function**
```javascript
buy: function (opts, cb)
```
Called from:
- https://github.com/carlos8f/zenbot/blob/master/lib/engine.js

Input:
```
  opts.price
  opts.size
```
Returns:
```

```
Callback:
```javascript
cb(null, body)
```

**Selling function**
```javascript
sell: function (opts, cb)
```
Called from:
- https://github.com/carlos8f/zenbot/blob/master/lib/engine.js

Input:
```
  opts.price
  opts.size
```
Returns:
```

```
Callback:
```javascript
cb(null, body)
```

**Getting data from a placed order**
```javascript
getOrder: function (opts, cb)
```
Called from:
- https://github.com/carlos8f/zenbot/blob/master/lib/engine.js

Input:
```
  opts.order_id
  opts.product_id
```
Returns:
```
  order.status
```
Expected values in https://github.com/carlos8f/zenbot/blob/master/lib/engine.js:
- 'done', 'rejected'
  If 'rejected' order.reject_reason = some_reason ('post only')
Is '*post only*' spesific for GDAX?
Comment: Needs some clarifying

Callback:
```javascript
cb(null, body)
```

**Getting details from an executed trade**
```javascript
getCursor: function (trade)
```
Called from:
- https://github.com/carlos8f/zenbot/blob/master/commands/backfill.js
- https://github.com/carlos8f/zenbot/blob/master/commands/trade.js

Input:
```
  trade - This is either a trade or a timestamp
```
Return:
```
  trade id or timestamp. It really depends on the exchange API. Some, like Gemini, use only timestamps and will only need to return a timestamp. Others, like GDAX operate on trade ids and it is expected to return 'undefined' when passed an initial timestamp to start backfilling.

  Since backfilling requires a timestamp to select the numbers of days to backfill, it may not be possible to use this option if the exchange does not use timestamps for historical data. In this case return 'undefined' when passed a timestamp value.

```
Callback:
```javascript

```

## Extensions

Zenbot offers various extensions, arguably it is what makes zenbot so awesome.

### Extending notifiers

If you wish to add a new notifier, please follow these steps:

- create a your-service-name.js in `/extensions/notifiers/` make sure to use the same function returns as other notifiers
- add config bootstrap to `/conf-sample.js`
- send us a PR with your new service :)
