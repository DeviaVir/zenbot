var constants = require('../conf/constants.json')

module.exports = function container (get, set, clear) {
  var bot = get('bot')
  if (bot.learned) {
    get('db.mems').destroy('learned', function (err, destroyed) {
      if (err) throw err
      else {
        console.log(JSON.stringify(destroyed || null, null, 2))
        process.exit()
      }
    })
    return null
  }
  if (bot.rs) {
    get('db.mems').destroy(constants.product_id, function (err, destroyed) {
      if (err) throw err
      console.log(JSON.stringify(destroyed || null, null, 2))
      process.exit()
    })
    return null
  }
  if (bot.balance) {
    get('db.mems').load('learned', function (err, learned) {
      if (err) throw err
      if (!learned) return process.exit()
      var old = learned.start_balance
      learned.start_balance = 0
      get('db.mems').save(learned, function (err, saved) {
        if (err) throw err
        console.log(JSON.stringify(old || null, null, 2))
        process.exit()
      })
    })
    return null
  }
  throw new Error('expected flag')
}