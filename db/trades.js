var n = require('numbro')

module.exports = function container (get, set) {
  var get_timestamp = get('zenbot:utils.get_timestamp')
  return get('db.createCollection')('trades', {
    save: function (obj, opts, cb) {
      obj.timestamp = get_timestamp(obj.time)
      //get('zenbot:console').info('trade', obj, {})
      cb()
    }
  })
}