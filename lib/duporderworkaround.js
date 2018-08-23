module.exports = {
  checkForPriorSell: function (s) {
    return !s.api_order || (s.api_order && s.api_order.tradetype != 'sell' && s.api_order.status != 'open') || (s.api_order && s.api_order.tradetype == 'sell' && s.api_order.status == 'done')
  },
  checkForPriorBuy:  function (s) {
    return !s.api_order || (s.api_order && s.api_order.tradetype != 'buy' && s.api_order.status != 'open') || (s.api_order && s.api_order.tradetype == 'buy' && s.api_order.status == 'done')
  }
}