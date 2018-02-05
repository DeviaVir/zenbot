var events = require('events')

module.exports = function container (get, set, clear) {

	/**
	 * Backfilling consists of two steps: consuming the trades, and processing (persisting) them.
	 * This function sets up the service that manages that.
	 */
	return function (targetTimeInMillis) {

		var cpService = get('lib.consumeAndProcessService')(get, set, clear)

		cpService.setOnConsumeFunc(get('commands.backfill.backfillConsumeFunction')(get, set, clear))
		cpService.setOnProcessFunc(get('commands.backfill.backfillProcessFunction')(get, set, clear))
		cpService.setAfterOnProcessFunc(get('commands.backfill.backfillUpdateScreenFunction')(get, set, clear))

		return new Promise((resolve, reject) => {
		  	cpService.go(targetTimeInMillis).then((finalTrade) => {
				resolve(finalTrade);
			})
		
		}, function (err) {
		
			console.log("Something bad happened while getting trades :(")
			console.log(err)
			reject()
		})
		
	}
}
