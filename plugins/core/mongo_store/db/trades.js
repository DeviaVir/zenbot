module.exports = function container (get, set) {
  var get_timestamp = get('zenbot:utils.get_timestamp')
  var get_id = get('zenbot:utils.get_id')
  return get('db.createCollection')('trades', {
    save: function (obj, opts, cb) {
      if (!obj.id) obj.id = get_id()
      obj.timestamp = get_timestamp(obj.time)
      cb(null, obj)
    }
  })
}