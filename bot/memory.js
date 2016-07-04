var constants = require('../conf/constants.json')

module.exports = function container (get, set, clear) {
  var bot = get('bot')
  get('db.mems').load(constants.product_id, function (err, rs) {
    if (err) throw err
    get('db.mems').load('learned', function (err, learned) {
      if (err) throw err
      console.log(JSON.stringify({rs: rs, learned: learned}, null, 2))
      setTimeout(process.exit, 1000)
    })
  })
  return null
}