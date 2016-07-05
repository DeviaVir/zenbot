var spawn = require('child_process').spawn
  , path = require('path')
  , assert = require('assert')
  , constants = require('../conf/constants.json')

module.exports = function container (get, set, clear) {
  var bot = get('bot')
  function withRs () {
    if (bot.learned) {
      spawn('git', ['checkout', '--', path.resolve(__dirname, '..', 'conf', 'defaults.json')])
        .once('exit', function (code) {
          assert(code === 0)
          get('db.mems').destroy('learned', function (err, destroyed) {
            if (err) throw err
            console.log(JSON.stringify(destroyed || null, null, 2))
            process.exit()
          })
        })
    }
    else process.exit()
  }
  if (bot.rs) {
    get('db.mems').destroy(constants.product_id, function (err, destroyed) {
      if (err) throw err
      console.log(JSON.stringify(destroyed || null, null, 2))
      withRs()
    })
  }
  else withRs()
  return null
}