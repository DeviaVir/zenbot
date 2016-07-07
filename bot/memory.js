var constants = require('../conf/constants.json')

module.exports = function container (get, set, clear) {
  var bot = get('bot')
  var resp = {}
  var get_timestamp = get('utils.get_timestamp')
  get('db.mems').load(constants.product_id, function (err, rs) {
    if (err) throw err
    resp.rs = rs
    get('db.mems').load('learned', function (err, learned) {
      if (err) throw err
      resp.learned = learned
      get('db.ticks').select({limit: 1, sort: {time: 1}}, function (err, ticks) {
        if (err) throw err
        if (ticks.length) {
          resp.first_timestamp = get_timestamp(ticks[0].time)
        }
        else {
          resp.first_timestamp = null
        }
         get('db.ticks').select({limit: 1, sort: {time: -1}}, function (err, ticks) {
          if (err) throw err
          if (ticks.length) {
            resp.last_timestamp = get_timestamp(ticks[0].time)
          }
          else {
            resp.last_timestamp = null
          }
          console.log(JSON.stringify(resp, null, 2))
          setTimeout(process.exit, 1000)
        })
      })
    })
  })
  return null
}