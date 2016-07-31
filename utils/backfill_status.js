var tb = require('timebucket')
  , z = require('zero-fill')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var current_period = null
  return function backfill_status (exchange, cb, isComplete) {
    var this_period = tb().resize(c.backfill_status_check).toString()
    if (current_period && this_period === current_period && !isComplete) {
      return cb()
    }
    //get('logger').info(z(c.max_slug_length, exchange.name + ' backfiller', ' '), 'checking status')
    current_period = this_period
    var sim_chunk_bucket = tb().resize(c.sim_chunk_size).subtract(1)
    get('db').collection('thoughts').count({
      app_name: get('app_name'),
      key: 'trade',
      time: {
        $lt: sim_chunk_bucket.toMilliseconds()
      }
    }, function (err, count) {
      if (err) return cb(err)
      //get('logger').info(z(c.max_slug_length, exchange.name + ' backfiller', ' '), 'checked status')
      if (!count) {
        get('logger').info(z(c.max_slug_length, exchange.name + ' backfiller', ' '), 'tick'.grey, sim_chunk_bucket.toString(), 'still backfilling'.grey)
        return cb()
      }
      //console.error('lt', sim_chunk_bucket.toString(), count)
      get('db').collection('thoughts').count({
        app_name: get('app_name'),
        key: 'trade',
        time: {
          $gte: sim_chunk_bucket.add(1).toMilliseconds()
        }
      }, function (err, count) {
        if (err) return cb(err)
        if (!count) {
          get('logger').info(z(c.max_slug_length, exchange.name + ' backfiller', ' '), 'tick'.grey, sim_chunk_bucket.toString(), 'not complete yet'.grey)
          return cb()
        }
        //console.error('gte', sim_chunk_bucket.toString(), count)
        get('db').collection('thoughts').count({
          app_name: get('app_name'),
          key: 'trade',
          time: {
            $lt: sim_chunk_bucket.toMilliseconds(),
            $gte: sim_chunk_bucket.subtract(1).toMilliseconds()
          }
        }, function (err, count) {
          if (err) return cb(err)
          //console.error('gte', sim_chunk_bucket.toString())
          if (!count) {
            get('logger').info(z(c.max_slug_length, exchange.name + ' backfiller', ' '), 'tick'.grey, sim_chunk_bucket.toString(), 'has no trades'.grey)
            return cb()
          }
          get('db').collection('thoughts').count({
            app_name: get('app_name'),
            key: 'trade',
            processed: false,
            time: {
              $lt: sim_chunk_bucket.add(1).toMilliseconds(),
              $gte: sim_chunk_bucket.subtract(1).toMilliseconds()
            }
          }, function (err, count) {
            if (err) return cb(err)
            if (count) {
              get('logger').info(z(c.max_slug_length, exchange.name + ' backfiller', ' '), 'tick'.grey, sim_chunk_bucket.toString(), 'still processing'.grey, count, 'trades'.grey)
              return setTimeout(function () {
                backfill_status(exchange, cb, true)
              }, c.backfill_status_timeout)
            }
            else {
              get('logger').info(z(c.max_slug_length, exchange.name + ' backfiller', ' '), 'tick'.grey, sim_chunk_bucket.toString(), 'complete with'.grey, count, 'trades'.grey)
            }
          })
        })
      })
    })
  }
}