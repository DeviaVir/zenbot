
/*
	Processes the trades.. 
*/
var collectionService = require('../../lib/services/collection-service')

module.exports = function (conf) {

  var collectionServiceInstance = collectionService(conf)

  return (targetTimeInMillis, queue, getIDofNextTradeToProcessFunc, cb) => { 
    var trades = queue.dequeue()

    var prev
    var curr
    var rtnTrade 
    var index = 0
    var moreInThisBatch = true
    var stopProcessingConditionReached = false

    do {
      prev = curr
      curr = trades[index++]

      if (curr === undefined) {
        rtnTrade = prev
        moreInThisBatch = false
      } else {
        if (curr.time > targetTimeInMillis)  {
          let skipToTradeId = getIDofNextTradeToProcessFunc(curr)

          //  if number we can skip to === currtrade
          if (skipToTradeId === curr.trade_id) {
            let lastTrade = curr
            let idx = {i: index}
            collectionServiceInstance.getTrades().insert(curr).then((/*err, doc*/) => {
              if (idx.i === trades.length) {
                cb(null, false, lastTrade.trade_id, lastTrade) 
              }
            })
          }
          else {
            moreInThisBatch = false
            cb(null, false, skipToTradeId, curr)
          }
        } else {
          // this is past our time limit...
          moreInThisBatch = false
          stopProcessingConditionReached = true
          rtnTrade = prev || curr
        }
      } 

    } while (moreInThisBatch)

    if (stopProcessingConditionReached) {
      cb(null, stopProcessingConditionReached, rtnTrade.trade_id, rtnTrade)
    }
  }

}