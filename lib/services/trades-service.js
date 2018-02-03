
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
					if (exchangeService.getExchange().historyScanUsesTime) {

						var id = _getFromOrToFromExchangeAttributes(exchangeAttributes);

						if (id) {

							// this exchange uses time to get its trades. So before we call the exchange for
							//  this batch of trades, we'll need to get the trade object belonging to the ID
							//  that was passed in

							// TODO: We should just be able to pass the exchange the tradeId, and if it needs
							//  to get the trade object, it would do it itself. That keeps this tradesService
							//  more general.

							var selectorNormalized = exchangeService.getSelector().normalized;

							collectionService.getTrades().findOne({id: selectorNormalized+"-"+id}).then((result) => {
								_setFromOrToOnExchangeAttributesToTime(result, exchangeAttributes);
								resolveUsingExchangeServiceGetTrades();
							})
						} else {
							resolveUsingExchangeServiceGetTrades()
						}
					}
					else {
						resolveUsingExchangeServiceGetTrades()
					}
				} else {
					resolve(data)
				}
			})

			function resolveUsingExchangeServiceGetTrades() {
				exchangeService.getExchange().getTrades(exchangeAttributes, function(err, results) {
					if (err) throw err;

					// add our internal id to the trade
					results.map((trade) => {
						trade.trade_id *= 1 // force trade id to a number
						trade.id = exchangeService.getSelector().normalized + "-" + trade.trade_id
					})

					resolve(results);
				})
			}
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

	function _getFromOrToFromExchangeAttributes(ea) {
		if (exchangeService.getExchange().historyScan == exchangeService.BACKWARD) {
			return ea.to;
		} else {
			return ea.from;
		}
	}

	function _setFromOrToOnExchangeAttributesToTime(trade, ea) {
		if (exchangeService.getExchange().historyScan == exchangeService.BACKWARD) {
			ea.to = trade.time;
		} else {
			ea.from = trade.time;
		}
	}

	return theService
	
})