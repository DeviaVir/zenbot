module.exports = function container (get, set) {
  var get_timestamp = get('zenbot:utils.get_timestamp')
  return get('db.createCollection')('trades', {
    save: function (trade, opts, cb) {
      if (!trade.timestamp) {
        trade.timestamp = get_timestamp(trade.time)
        trade.processed = false
      }
      cb(null, trade)
    }
  })
}