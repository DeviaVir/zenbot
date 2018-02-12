module.exports = {
  name: 'noop',
  description: 'Just do nothing. Can be used to e.g. generate candlesticks for training the genetic forex strategy.',

  getOptions: function () {
    this.option('period', 'period length, same as --period_length', String, '30m')
    this.option('period_length', 'period length, same as --period', String, '30m')
  },

  calculate: function () {

      // Get the first bid/ask order amounts and price
      s.exchange.getOrderBook({product_id: s.product_id}, function (err, order_quote) {
        if (err) {
          console.log('Error getting orderbook.');
          throw err;
        };
        // Here we set the current Bid and Ask amount
        s.options.myBidAmount = order_quote.buyOrderAmount;
        s.options.myAskAmount = order_quote.sellOrderAmount;
        // Here we set the current Bid and Ask amount of the first position in the order book
        s.options.theBidPrice = order_quote.buyOrderRate;
        s.options.theBidPrice = parseFloat(s.options.theBidPrice);
        s.options.theAskPrice = order_quote.sellOrderRate;
        s.options.theAskPrice = parseFloat(s.options.theAskPrice);
      }

  },

  onPeriod: function (s, cb) {
    cb()
  },

  onReport: function () {
    var cols = []
    return cols
  }
}

