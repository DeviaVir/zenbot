/* ============================================================
 * node-binance-api
 * https://github.com/jaggedsoft/node-binance-api
 * Copied file because I needed to make some minor changes, will submit a PR once it works.
 * ============================================================
 * Copyright 2017-, Jon Eyrick
 * Released under the MIT License
 * ============================================================ */

module.exports = function() {
  'use strict';
  const WebSocket = require('ws');
  const request = require('request');
  const crypto = require('crypto');
  const base = 'https://www.binance.com/api/';
  const websocket_base = 'wss://stream.binance.com:9443/ws/';
  let messageQueue = {};
  let depthCache = {};
  let ohlcLatest = {};
  let klineQueue = {};
  let options = {};
  let info = {};
  let ohlc = {};

  const publicRequest = function(url, data, callback, method = "GET") {
    if ( !data ) data = {};
    let opt = {
      url: url,
      qs: data,
      method: method,
      agent: false,
      headers: {
        'User-Agent': 'Mozilla/4.0 (compatible; Node Binance API)',
        'Content-type': 'application/x-www-form-urlencoded'
      }
    };
    request(opt, function(error, response, body) {
      if ( !response || !body ) throw "publicRequest error: "+error;
      if ( callback ) callback(JSON.parse(body));
    });
  };

  const apiRequest = function(url, callback, method = "GET") {
    let opt = {
      url: url,
      method: method,
      agent: false,
      headers: {
        'User-Agent': 'Mozilla/4.0 (compatible; Node Binance API)',
        'Content-type': 'application/x-www-form-urlencoded',
        'X-MBX-APIKEY': options.APIKEY
      }
    };
    request(opt, function(error, response, body) {
      if ( !response || !body ) throw "apiRequest error: "+error;
      if ( callback ) callback(JSON.parse(body));
    });
  };

  const signedRequest = function(url, data, callback, method = "GET") {
    if ( !data ) data = {};
    data.timestamp = new Date().getTime();
    if ( typeof data.symbol !== "undefined" ) data.symbol = data.symbol.replace('_','');
    if ( typeof data.recvWindow == "undefined" ) data.recvWindow = 6500;
    let query = Object.keys(data).reduce(function(a,k){a.push(k+'='+encodeURIComponent(data[k]));return a},[]).join('&');
    let signature = crypto.createHmac("sha256", options.APISECRET).update(query).digest("hex"); // set the HMAC hash header
    let opt = {
      url: url+'?'+query+'&signature='+signature,
      method: method,
      agent: false,
      headers: {
        'User-Agent': 'Mozilla/4.0 (compatible; Node Binance API)',
        'Content-type': 'application/x-www-form-urlencoded',
        'X-MBX-APIKEY': options.APIKEY
      }
    };
    request(opt, function(error, response, body) {
      if ( !response || !body ) throw "signedRequest error: "+error;
      if ( callback ) callback(JSON.parse(body));
    });
  };

  const order = function(side, symbol, quantity, price, flags = {}, callback) {
    let opt = {
      symbol: symbol,
      side: side,
      type: "LIMIT",
      price: price,
      quantity: quantity,
      timeInForce: "GTC",
      recvWindow: 60000
    };
    if ( typeof flags.type !== "undefined" ) opt.type = flags.type;
    if ( typeof flags.icebergQty !== "undefined" ) opt.icebergQty = flags.icebergQty;
    if ( typeof flags.stopPrice !== "undefined" ) opt.stopPrice = flags.stopPrice;
    signedRequest(base+"v3/order", opt, callback, "POST");
  };
  ////////////////////////////
  const subscribe = function(endpoint, callback) {
    const ws = new WebSocket(websocket_base+endpoint);
    ws.on('open', function() {
      //console.log("subscribe("+endpoint+")");
    });
    ws.on('close', function() {
      console.log("WebSocket connection closed");
    });

    ws.on('message', function(data) {
      //console.log(data);
      callback(JSON.parse(data));
    });
  };
  const userDataHandler = function(data) {
    let type = data.e;
    if ( type == "outboundAccountInfo" ) {
      options.balance_callback(data);
    } else if ( type == "executionReport" ) {
      options.execution_callback(data);
    } else {
      console.log("Unexpected data: "+type);
    }
  };
  ////////////////////////////
  const priceData = function(data) {
    let prices = {};
    for ( let obj of data ) {
      prices[obj.symbol] = obj.price;
    }
    return prices;
  };
  const bookPriceData = function(data) {
    let prices = {};
    for ( let obj of data ) {
      prices[obj.symbol] = {
        bid:obj.bidPrice,
        bids:obj.bidQty,
        ask:obj.askPrice,
        asks:obj.askQty
      };
    }
    return prices;
  };
  const balanceData = function(data) {
    let balances = {};
    for ( let obj of data.balances ) {
      balances[obj.asset] = {available:obj.free, onOrder:obj.locked};
    }
    return balances;
  };
  const klineData = function(symbol, interval, ticks) { // Used for /depth
    let last_time = 0;
    for ( let tick of ticks ) {
      let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = tick;
      ohlc[symbol][interval][time] = {open:open, high:high, low:low, close:close, volume:volume};
      last_time = time;
    }
    info[symbol][interval].timestamp = last_time;
  };
  const klineConcat = function(symbol, interval) { // Combine all OHLC data with latest update
    let output = ohlc[symbol][interval];
    if ( typeof ohlcLatest[symbol][interval].time == "undefined" ) return output;
    const time = ohlcLatest[symbol][interval].time;
    const last_updated = Object.keys(ohlc[symbol][interval]).pop();
    if ( time >= last_updated ) {
      output[time] = ohlcLatest[symbol][interval];
      delete output[time].time;
      output[time].isFinal = false;
    }
    return output;
  };
  const klineHandler = function(symbol, kline, firstTime = 0) { // Used for websocket @kline
    //TODO: add Taker buy base asset volume
    let { e:eventType, E:eventTime, k:ticks } = kline;
    let { o:open, h:high, l:low, c:close, v:volume, i:interval, x:isFinal, q:quoteVolume, t:time } = ticks; //n:trades, V:buyVolume, Q:quoteBuyVolume
    if ( time <= firstTime ) return;
    if ( !isFinal ) {
      if ( typeof ohlcLatest[symbol][interval].time !== "undefined" ) {
        if ( ohlcLatest[symbol][interval].time > time ) return;
      }
      ohlcLatest[symbol][interval] = {open:open, high:high, low:low, close:close, volume:volume, time:time};
      return;
    }
    // Delete an element from the beginning so we don't run out of memory
    const first_updated = Object.keys(ohlc[symbol][interval]).shift();
    if ( first_updated ) delete ohlc[symbol][interval][first_updated];
    ohlc[symbol][interval][time] = {open:open, high:high, low:low, close:close, volume:volume};
  };
  const depthData = function(data) { // Used for /depth endpoint
    let bids = {}, asks = {}, obj;
    for ( obj of data.bids ) {
      bids[obj[0]] = parseFloat(obj[1]);
    }
    for ( obj of data.asks ) {
      asks[obj[0]] = parseFloat(obj[1]);
    }
    return {bids:bids, asks:asks};
  }
  const depthHandler = function(depth, firstUpdateId = 0) { // Used for websocket @depth
    let symbol = depth.s, obj;
    if ( depth.u <= firstUpdateId ) return;
    for ( obj of depth.b ) { //bids
      depthCache[symbol].bids[obj[0]] = parseFloat(obj[1]);
      if ( obj[1] == '0.00000000' ) {
        delete depthCache[symbol].bids[obj[0]];
      }
    }
    for ( obj of depth.a ) { //asks
      depthCache[symbol].asks[obj[0]] = parseFloat(obj[1]);
      if ( obj[1] == '0.00000000' ) {
        delete depthCache[symbol].asks[obj[0]];
      }
    }
  };
  const depthVolume = function(symbol) { // Calculate Buy/Sell volume from DepthCache
    let cache = getDepthCache(symbol), quantity, price;
    let bidbase = 0, askbase = 0, bidqty = 0, askqty = 0;
    for ( price in cache.bids ) {
      quantity = cache.bids[price];
      bidbase+= parseFloat((quantity * parseFloat(price)).toFixed(8));
      bidqty+= quantity;
    }
    for ( price in cache.asks ) {
      quantity = cache.asks[price];
      askbase+= parseFloat((quantity * parseFloat(price)).toFixed(8));
      askqty+= quantity;
    }
    return {bids: bidbase, asks: askbase, bidQty: bidqty, askQty: askqty};
  };
  const getDepthCache = function(symbol) {
    if ( typeof depthCache[symbol] == "undefined" ) return {bids: {}, asks: {}};
    return depthCache[symbol];
  };
  ////////////////////////////
  return {
    depthCache: function(symbol) {
      return getDepthCache(symbol);
    },
    depthVolume: function(symbol) {
      return depthVolume(symbol);
    },
    percent: function(min, max, width = 100) {
      return ( min * 0.01 ) / ( max * 0.01 ) * width;
    },
    sum: function(array) {
      return array.reduce((a, b) => a + b, 0);
    },
    reverse: function(object) {
      let range = Object.keys(object).reverse(), output = {};
      for ( let price of range ) {
        output[price] = object[price];
      }
      return output;
    },
    sortBids: function(symbol, max = Infinity, baseValue = false) {
      let object = {}, count = 0, cache;
      if ( typeof symbol == "object" ) cache = symbol;
      else cache = getDepthCache(symbol).bids;
      let sorted = Object.keys(cache).sort(function(a, b){return parseFloat(b)-parseFloat(a)});
      for ( let price of sorted ) {
        if ( !baseValue ) object[price] = cache[price];
        else object[price] = parseFloat((cache[price] * parseFloat(price)).toFixed(8));
        if ( ++count > max ) break;
      }
      return object;
    },
    sortAsks: function(symbol, max = Infinity, baseValue = false) {
      let object = {}, count = 0, cache;
      if ( typeof symbol == "object" ) cache = symbol;
      else cache = getDepthCache(sparseFloatymbol).asks;
      let sorted = Object.keys(cache).sort(function(a, b){return parseFloat(a)-parseFloat(b)});
      for ( let price of sorted ) {
        if ( !baseValue ) object[price] = cache[price];
        else object[price] = parseFloat((cache[price] * parseFloat(price)).toFixed(8));
        if ( ++count > max ) break;
      }
      return object;
    },
    first: function(object) {
      return Object.keys(object).shift();
    },
    last: function(object) {
      return Object.keys(object).pop();
    },
    slice: function(object, start = 0) {
      return Object.entries(object).slice(start).map(entry => entry[0]);
    },
    options: function(opt) {
      options = opt;
    },
    buy: function(symbol, quantity, price, flags = {}, callback) {
      order("BUY", symbol, quantity, price, flags, callback);
    },
    sell: function(symbol, quantity, price, flags = {}, callback) {
      order("SELL", symbol, quantity, price, flags, callback);
    },
    cancel: function(symbol, orderid, callback) {
      signedRequest(base+"v3/order", {symbol:symbol, orderId:orderid}, callback, "DELETE");
    },
    orderStatus: function(symbol, orderid, callback) {
      signedRequest(base+"v3/order", {symbol:symbol, orderId:orderid}, callback);
    },
    openOrders: function(symbol, callback) {
      signedRequest(base+"v3/openOrders", {symbol:symbol}, callback);
    },
    allOrders: function(symbol, callback) {
      signedRequest(base+"v3/allOrders", {symbol:symbol, limit:500}, callback);
    },
    depth: function(symbol, callback) {
      publicRequest(base+"v1/depth", {symbol:symbol}, function(data) {
        return callback(depthData(data));
      });
    },
    prices: function(callback) {
      request(base+"v1/ticker/allPrices", function(error, response, body) {
        if ( !response || !body ) throw "allPrices error: "+error;
        if ( callback ) callback(priceData(JSON.parse(body)));
      });
    },
    bookTickers: function(callback) {
      request(base+"v1/ticker/allBookTickers", function(error, response, body) {
        if ( !response || !body ) throw "allBookTickers error: "+error;
        if ( callback ) callback(bookPriceData(JSON.parse(body)));
      });
    },
    prevDay: function(symbol, callback) {
      publicRequest(base+"v1/ticker/24hr", {symbol:symbol}, callback);
    },
    account: function(callback) {
      signedRequest(base+"v3/account", {}, callback);
    },
    balance: function(callback) {
      signedRequest(base+"v3/account", {}, function(data) {
        if ( callback ) callback(balanceData(data));
      });
    },
    trades: function(symbol,callback) {
      signedRequest(base+"v3/myTrades", {symbol:symbol}, callback);
    },
    ohlc: function(chart) {
      let open = [], high = [], low = [], close = [], volume = [];
      for ( let timestamp in chart ) { //ohlc[symbol][interval]
        let obj = chart[timestamp];
        open.push(parseFloat(obj.open));
        high.push(parseFloat(obj.high));
        low.push(parseFloat(obj.low));
        close.push(parseFloat(obj.close));
        volume.push(parseFloat(obj.volume));
      }
      return {open:open, high:high, low:low, close:close, volume:volume};
    },
    candlesticks: function(symbol, interval = "5m", callback) { //1m,3m,5m,15m,30m,1h,2h,4h,6h,8h,12h,1d,3d,1w,1M
      publicRequest(base+"v1/klines", {symbol:symbol, interval:interval}, callback);
    },
    aggregatedTrades: function(symbol, callback, fromId, startTime, endTime) {
      publicRequest(base+"v1/aggTrades", {symbol:symbol, fromId: fromId, startTime: startTime, endTime: endTime}, callback);
    },
    publicRequest: function(url, data, callback, method = "GET") {
      publicRequest(url, data, callback, method)
    },
    signedRequest: function(url, data, callback, method = "GET") {
      signedRequest(url, data, callback, method);
    },
    websockets: {
      userData: function(callback, execution_callback = null) {
        apiRequest(base+"v1/userDataStream", function(response) {
          options.listenKey = response.listenKey;
          setInterval(function() { // keepalive
            apiRequest(base+"v1/userDataStream", false, "PUT");
          },30000);
          if ( typeof execution_callback == "function" ) {
            options.balance_callback = callback;
            options.execution_callback = execution_callback;
            subscribe(options.listenKey, userDataHandler);
            return;
          }
          subscribe(options.listenKey, callback);
        },"POST");
      },
      subscribe: function(url, callback) {
        subscribe(url, callback);
      },
      depth: function(symbols, callback) {
        for ( let symbol of symbols ) {
          subscribe(symbol.toLowerCase()+"@depth", callback);
        }
      },
      depthCache: function(symbols, callback) {
        for ( let symbol of symbols ) {
          if ( typeof info[symbol] == "undefined" ) info[symbol] = {};
          info[symbol].firstUpdateId = 0;
          depthCache[symbol] = {bids: {}, asks: {}};
          messageQueue[symbol] = [];
          subscribe(symbol.toLowerCase()+"@depth", function(depth) {
            if ( !info[symbol].firstUpdateId ) {
              messageQueue[symbol].push(depth);
              return;
            }
            depthHandler(depth);
            if ( callback ) callback(symbol, depthCache[symbol]);
          });
          publicRequest(base+"v1/depth", {symbol:symbol}, function(json) {
            info[symbol].firstUpdateId = json.lastUpdateId;
            depthCache[symbol] = depthData(json);
            for ( let depth of messageQueue[symbol] ) {
              depthHandler(depth, json.lastUpdateId);
            }
            delete messageQueue[symbol];
            if ( callback ) callback(symbol, depthCache[symbol]);
          });
        }
      },
      trades: function(symbols, callback) {
        for ( let symbol of symbols ) {
          subscribe(symbol.toLowerCase()+"@aggTrade", callback);
        }
      },
      chart: function(symbols, interval, callback) {
        for ( let symbol of symbols ) {
          if ( typeof info[symbol] == "undefined" ) info[symbol] = {};
          if ( typeof info[symbol][interval] == "undefined" ) info[symbol][interval] = {};
          if ( typeof ohlc[symbol] == "undefined" ) ohlc[symbol] = {};
          if ( typeof ohlc[symbol][interval] == "undefined" ) ohlc[symbol][interval] = {};
          if ( typeof ohlcLatest[symbol] == "undefined" ) ohlcLatest[symbol] = {};
          if ( typeof ohlcLatest[symbol][interval] == "undefined" ) ohlcLatest[symbol][interval] = {};
          if ( typeof klineQueue[symbol] == "undefined" ) klineQueue[symbol] = {};
          if ( typeof klineQueue[symbol][interval] == "undefined" ) klineQueue[symbol][interval] = [];
          info[symbol][interval].timestamp = 0;
          subscribe(symbol.toLowerCase()+"@kline_"+interval, function(kline) {
            if ( !info[symbol][interval].timestamp ) {
              klineQueue[symbol][interval].push(kline);
              return;
            }
            //console.log("@klines at " + kline.k.t);
            klineHandler(symbol, kline);
            if ( callback ) callback(symbol, interval, klineConcat(symbol, interval));
          });
          publicRequest(base+"v1/klines", {symbol:symbol, interval:interval}, function(data) {
            klineData(symbol, interval, data);
            //console.log("/klines at " + info[symbol][interval].timestamp);
            for ( let kline of klineQueue[symbol][interval] ) {
              klineHandler(symbol, kline, info[symbol][interval].timestamp);
            }
            delete klineQueue[symbol][interval];
            if ( callback ) callback(symbol, interval, klineConcat(symbol, interval));
          });
        }
      },
      candlesticks: function(symbols, interval, callback) {
        for ( let symbol of symbols ) {
          subscribe(symbol.toLowerCase()+"@kline_"+interval, callback);
        }
      }
    }
  };
}();
