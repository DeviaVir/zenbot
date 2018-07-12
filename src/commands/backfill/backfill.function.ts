import consumeAndProcessService from '../../services/consume-and-process-service'
import backfillConsumeFunction from './backfill.consume.function'
import backfillProcessFunction from './backfill.process.function'
import backfillUpdateScreenFunction from './backfill.update-screen.function'

export default (conf) => {
  /**
   * Backfilling consists of two steps: consuming the trades, and processing (persisting) them.
   * This function sets up the service that manages that.
   */
  return async (targetTimeInMillis) => {
    var cpService = consumeAndProcessService(conf)

    cpService.setOnConsumeFunc(backfillConsumeFunction(conf))
    cpService.setOnProcessFunc(backfillProcessFunction(conf))
    cpService.setAfterOnProcessFunc(backfillUpdateScreenFunction)

    try {
      await cpService.go(targetTimeInMillis)
    } catch (err) {
      console.log('Something bad happened while getting trades :(')
      console.log(err)
    }
  }
}
