
module.exports = (function (get, set, clear) {

	var collectionService = get('lib.collection-service')(get, set, clear)
	var exchangeService = get('lib.exchange-service')(get, set, clear)

	var theService = {}

	theService.getTrades = function (tradeId, queryAttributes, exchangeAttributes) {
		if (queryAttributes === undefined)
			queryAttributes = _getInitialQueryAttributes(tradeId);

		if (exchangeAttributes === undefined)
			exchangeAttributes = _getInitialExchangeAttributes(tradeId)

		return new Promise(function (resolve, reject) {

			//  check the database,
			collectionService.getTrades().find(queryAttributes).limit(100).toArray(function (err, data) { 
				if (data.length === 0) {

					//  if not the database, then check the exchange's api
					exchangeService.getExchange().getTrades(exchangeAttributes, function(err, results) {
						if (err) throw err;

						// add our internal id to the trade
						results.map((trade) => {
							trade.id = exchangeService.getSelector().normalized + "-" + trade.trade_id
						})

						resolve(results);
					})
				} else {
					resolve(data)
				}
			})
		})
	}

	function _getInitialQueryAttributes(tradeId) {
		var q = {};

		var selectorNormalized = exchangeService.getSelector().normalized;

		q.id = new RegExp("/^" + selectorNormalized + "/")

		if (tradeId !== undefined)
			q.trade_id = { $lt: tradeId }

		return q;
	}

	function _getInitialExchangeAttributes(tradeId) {
		var q = {};

		q.product_id = exchangeService.getSelector().asset + "-" + exchangeService.getSelector().currency

		if (tradeId !== undefined){
			if (exchangeService.getExchange().historyScan == exchangeService.BACKWARD) {
				q.to = tradeId;
			} else {
				q.from = tradeId;
			}
		}

		return q;
	}

	theService.getInitialQueryAttributes = function(tradeId) {
		return _getInitialQueryAttributes(tradeId)
	}

	theService.getInitialExchangeAttributes = function(tradeId) {
		return _getInitialExchangeAttributes(tradeId)
	}

	return theService
	
})