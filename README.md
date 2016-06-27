# gdax-history

This thing will stream the [GDAX](https://gdax.com/) order book using the public API and insert records into a `messages` collection in a local MongoDB db called `gdax_history`.

Useful for historical analysis of the order book.

## Usage

```
$ npm install
$ node recorder.js
```
