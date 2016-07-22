var n = require('numbro')
  , z = require('zero-fill')
  , colors = require('colors')

module.exports = function container (get, set, clear) {
  var c = get('constants')
  var strategy = get('strategies.zmi')
  return function thinker (tick, cb) {
    cb()
  }
}