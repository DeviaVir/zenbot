var tb = require('timebucket')
  , z = require('zero-fill')

module.exports = function container (get, set, clear) {
  var c = get('config')
  return function backfill_status (exchange, cb) {
    var sim_chunk_bucket = tb(c.sim_chunk_size).subtract(1)
    get('db').collection('thoughts').count({
      app_name: get('app_name'),
      time: {
        $lt: sim_chunk_bucket.toMilliseconds()
      }
    }, function (err, count) {
      if (err) return cb(err)
      if (!count) return cb()
      get('db').collection('thoughts').count({
        app_name: get('app_name'),
        time: {
          $gte: sim_chunk_bucket.add(1).toMilliseconds()
        }
      }, function (err, count) {
        if (err) return cb(err)
        if (!count) return cb()
        get('db').collection('thoughts').count({
          app_name: get('app_name'),
          time: {
            $lt: sim_chunk_bucket.toMilliseconds(),
            $gte: sim_chunk_bucket.subtract(1).toMilliseconds()
          }
        }, function (err, count) {
          if (err) return cb(err)
          get('logger').info(z(c.max_slug_length, exchange.name + ' backfiller', ' '), 'tick'.grey, sim_chunk_bucket.subtract(1).toString(), 'complete with'.grey, count, 'thoughts'.grey)
        })
      })
    })
  }
}