# Zenbot Tips for Kraken

The following tips can increase reliability in using Zenbot with Kraken.

## API Rate Limit

These errors mean that Zenbot is sending too many requests to Kraken in a given amount of time:
> Kraken API error - unable to call getTrades (Error: Kraken API returned error: API:Rate limit exceeded), retrying in

There are two ways past this:
* Increase your [Kraken Account Tier](https://support.kraken.com/hc/en-us/articles/206548367-What-is-the-API-call-rate-limit-). Higher tier accounts have a more relaxed rate limit. 
* Increase poll timers in the zenbot `conf.js`. This reduces how many requests Zenbot is sending in a given amount of time.

### Poll Timers
The following `conf.js` settings have helped prevent this from happening:
```javascript
// Poll order status every 3 seconds
c.order_poll_time = 3000

// Poll new trades every 6 seconds
c.poll_trades = 6000
```

## Kraken API returned error: API:Invalid nonce

This is a common error when calling exchange APIs on a regular basis:
>Kraken API warning - unable to call getBalance (Error: Kraken API returned error: API:Invalid nonce), retrying in 0.15s

Nonce errors aren't usually an issue but can introduce a slight delay in your trading. In Kraken, you can increase your API Nonce window, reducing the chances of this happening. 

Log into your Kraken account, navigate through *Settings* then *API*, select your API Key and increase your *Nonce Window* for the API Key used by Zenbot. 


## Orders Placed & Forgotten

I've seen Zenbot getting stuck with `Selling` or `Buying`. Checking for open orders in Kraken, I see the open order there, but Zenbot doesn't seem to have realised the order was placed. This usually happens while the Kraken API is under high load.

The solution to this is a simple change in this javascript file:
```
node_modules/kraken-api/kraken.js
```

Look for this line:
```
	var config = {
		url: 'https://api.kraken.com',
		version: '0',
		key: key,
		secret: secret,
		otp: otp,
		timeoutMS: 5000
	};
```

Increase the timeoutMS value, for example:
```
	var config = {
		url: 'https://api.kraken.com',
		version: '0',
		key: key,
		secret: secret,
		otp: otp,
		timeoutMS: 30000
	};
```