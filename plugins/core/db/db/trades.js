module.exports = function container (get, set) {
  var get_timestamp = get('zenbot:utils.get_timestamp')
  var get_id = get('zenbot:utils.get_id')
  var config = get('config')
  return get('db.createCollection')('trades', {
    save: function (trade, opts, cb) {
      trade.id = trade.exchange + '-' + trade.id
      trade.processed = false
      trade.timestamp = get_timestamp(trade.time)
      cb(null, trade)
    }
  })
}