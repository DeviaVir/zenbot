var collectionService = require('./collection-service'),
  exchangeService = require('./exchange-service')

module.exports = function (conf) {

  var collectionServiceInstance = collectionService(conf)
  var exchangeServiceInstance = exchangeService(conf)

  var theService = {}

  theService.getTrades = function (tradeId, queryAttributes, exchangeAttributes) {
    if (queryAttributes === undefined)
      queryAttributes = _getInitialQueryAttributes(tradeId)

    if (exchangeAttributes === undefined)
      exchangeAttributes = _getInitialExchangeAttributes(tradeId)

    return new Promise(function (resolve, reject) {

      //  check the database,
      collectionServiceInstance.getTrades().find(queryAttributes).limit(100).toArray(function (err, data) { 
        if (data.length === 0) {

          //  if not the database, then check the exchange's api
          exchangeServiceInstance.getExchange().getTrades(exchangeAttributes, function(err, results) {
            if (err) throw err

            // add our internal id to the trade
            results.map((trade) => {
              trade.id = exchangeServiceInstance.getSelector().normalized + '-' + trade.trade_id
            })

            resolve(results)
          })
        } else {
          resolve(data)
        }
      })
    })
  }

  function _getInitialQueryAttributes(tradeId) {
    var q = {}

    var selectorNormalized = exchangeServiceInstance.getSelector().normalized

    q.id = new RegExp('/^' + selectorNormalized + '/')

    if (tradeId !== undefined)
      q.trade_id = { $lt: tradeId }

    return q
  }

  function _getInitialExchangeAttributes(tradeId) {
    var q = {}

    q.product_id = exchangeServiceInstance.getSelector().asset + '-' + exchangeServiceInstance.getSelector().currency

    if (tradeId !== undefined){
      if (exchangeServiceInstance.getExchange().historyScan == exchangeServiceInstance.BACKWARD) {
        q.to = tradeId
      } else {
        q.from = tradeId
      }
    }

    return q
  }

  theService.getInitialQueryAttributes = function(tradeId) {
    return _getInitialQueryAttributes(tradeId)
  }

  theService.getInitialExchangeAttributes = function(tradeId) {
    return _getInitialExchangeAttributes(tradeId)
  }

  return theService
    
}