var colors = require('colors')

module.exports = function container (get, set, clear) {
  return function () {
    console.error('info')
    get('app').close(function () {
      process.exit()
    })
  }
}