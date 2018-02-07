var consumeAndProcessService = require('../../lib/services/consume-and-process-service'),
  backfillConsumeFunction = require('./backfill.consume.function'),
  backfillProcessFunction = require('./backfill.process.function'),
  backfillUpdateScreenFunction = require('./backfill.update-screen.function')

module.exports = function container (conf) {

  /**
	 * Backfilling consists of two steps: consuming the trades, and processing (persisting) them.
	 * This function sets up the service that manages that.
	 */
  return function (targetTimeInMillis) {
    var cpService = consumeAndProcessService(conf)

    cpService.setOnConsumeFunc(backfillConsumeFunction(conf))
    cpService.setOnProcessFunc(backfillProcessFunction(conf))
    cpService.setAfterOnProcessFunc(backfillUpdateScreenFunction)

    return new Promise((resolve/*, reject*/) => {
      cpService.go(targetTimeInMillis).then((finalTrade) => {
        resolve(finalTrade)
      })
    }, function (err) {
      console.log('Something bad happened while getting trades :(')
      console.log(err)
    })
		
  }
}
