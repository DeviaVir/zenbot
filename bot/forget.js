var spawn = require('child_process').spawn
  , path = require('path')
  , assert = require('assert')

module.exports = function container (get, set, clear) {
  spawn('git', ['checkout', '--', path.resolve(__dirname, '..', 'conf', 'defaults.json')])
    .once('exit', function (code) {
      assert(code === 0)
      get('db.mems').destroy('learned', function (err, destroyed) {
        if (err) throw err
        console.log(JSON.stringify(destroyed || null, null, 2))
        process.exit()
      })
    })
  return null
}