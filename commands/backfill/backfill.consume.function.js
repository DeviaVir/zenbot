
/* This module provides a function, used in the backfill process, to consume trades. 

	It is accompanied by another class which processes those trades. In this case,
	processing means storing in the database.

	It makes a call to a service to get trades. If trades are returned, it stores
	them in a queue. Finally, regardless, a status code is returned. Its either cp_process, 
	to process the trades, or cp_exit, exit the consume-and-process flow.
*/

module.exports = (function (get, set, clear) {		

	tradesService = get('lib.trades-service')(get, set, clear)

	return (mostRecentlyProcessedTradeId, queue, cb) => {
		tradesService.getTrades(mostRecentlyProcessedTradeId).then(function (returnedTrades) {
			if (returnedTrades.length > 0) {
				queue.enqueue(returnedTrades.sort((a, b) => {
						return b.trade_id - a.trade_id;
					})
				);
				cb(null, 'cp_process', returnedTrades[returnedTrades.length - 1].trade_id)
			}
			else {
				cb(null, 'cp_exit', undefined)
			}
		})

	}
})