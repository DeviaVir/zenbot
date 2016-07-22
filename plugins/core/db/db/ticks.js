var tb = require('timebucket')

module.exports = function container (get, set) {
  var get_timestamp = get('zenbot:utils.get_timestamp')
  return get('db.createCollection')('ticks', {
    save: function (tick, opts, cb) {
      tick.timestamp = get_timestamp(tick.time)
      get('db.mongo.db').collection('ticks').update(
        {
          time: {
            $lt: tick.time
          },
          complete: false,
          size: tick.size
        },
        {
          $set: {
            complete: true
          }
        },
        {
          multi: true
        },
        function (err, result) {
          if (err) return cb(err)
          cb(null, tick)
        })
    }
  })
}