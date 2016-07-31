var tb = require('timebucket')
  , z = require('zero-fill')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var current_period = null
  return function backfill_status (exchange, cb, isComplete) {
    var rs = get('run_state')
    rs[exchange.name] || (rs[exchange.name] = {sim_chunks: {}})
    var sim_chunk_bucket = tb().resize(c.sim_chunk_size).subtract(c.sim_chunks_required + 1)
    var sim_chunk = rs[exchange.name].sim_chunks[sim_chunk_bucket.toString()]
    if (sim_chunk) {
      get('logger').info(z(c.max_slug_length, exchange.name + ' backfiller', ' '), 'tick'.grey, sim_chunk_bucket.toString(), 'complete with'.grey, sim_chunk, 'trades'.grey)
      return
    }
    var this_period = tb().resize(c.backfill_status_check).toString()
    if (this_period === current_period) {
      return cb()
    }
    //get('logger').info(z(c.max_slug_length, exchange.name + ' backfiller', ' '), 'checking status')
    current_period = this_period
    var sim_chunk_end = tb().resize(c.sim_chunk_size)
    get('db').collection('thoughts').count({
      app_name: get('app_name'),
      key: 'trade',
      'value.exchange': exchange.name,
      time: {
        $lt: sim_chunk_bucket.toMilliseconds()
      }
    }, function (err, num_before) {
      if (err) return cb(err)
      //get('logger').info(z(c.max_slug_length, exchange.name + ' backfiller', ' '), 'checked status')
      if (!num_before) {
        get('logger').info(z(c.max_slug_length, exchange.name + ' backfiller', ' '), 'tick'.grey, sim_chunk_bucket.toString(), 'still backfilling'.grey)
        return cb()
      }
      //console.error('lt', sim_chunk_bucket.toString(), count)
      get('db').collection('thoughts').count({
        app_name: get('app_name'),
        key: 'trade',
        'value.exchange': exchange.name,
        time: {
          $gte: sim_chunk_end.toMilliseconds()
        }
      }, function (err, num_after) {
        if (err) return cb(err)
        if (!num_after) {
          get('logger').info(z(c.max_slug_length, exchange.name + ' backfiller', ' '), 'tick'.grey, sim_chunk_bucket.toString(), 'not complete yet'.grey)
          return cb()
        }
        //console.error('gte', sim_chunk_bucket.toString(), count)
        get('db').collection('thoughts').count({
          app_name: get('app_name'),
          key: 'trade',
          'value.exchange': exchange.name,
          time: {
            $lt: sim_chunk_end.toMilliseconds(),
            $gte: sim_chunk_bucket.toMilliseconds()
          }
        }, function (err, num_in_chunk) {
          if (err) return cb(err)
          //console.error('gte', sim_chunk_bucket.toString())
          if (!num_in_chunk) {
            get('logger').info(z(c.max_slug_length, exchange.name + ' backfiller', ' '), 'tick'.grey, sim_chunk_bucket.toString(), 'has no trades'.grey)
            return cb()
          }
          get('db').collection('thoughts').count({
            app_name: get('app_name'),
            key: 'trade',
            'value.exchange': exchange.name,
            processed: false,
            time: {
              $lt: sim_chunk_end.toMilliseconds(),
              $gte: sim_chunk_bucket.toMilliseconds()
            }
          }, function (err, num_unprocssed) {
            if (err) return cb(err)
            if (num_unprocssed) {
              get('logger').info(z(c.max_slug_length, exchange.name + ' backfiller', ' '), 'tick'.grey, sim_chunk_bucket.toString(), 'still processing'.grey, num_unprocssed, 'trades'.grey)
              setTimeout(function () {
                backfill_status(exchange, cb, true)
              }, c.backfill_status_timeout)
            }
            else {
              rs[exchange.name].sim_chunks[sim_chunk_bucket.toString()] = num_in_chunk
              get('logger').info(z(c.max_slug_length, exchange.name + ' backfiller', ' '), 'tick'.grey, sim_chunk_bucket.toString(), 'complete with'.grey, num_in_chunk, 'trades'.grey)
            }
          })
        })
      })
    })
  }
}