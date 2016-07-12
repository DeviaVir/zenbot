var BFX = require('bitfinex-api-node')
  , constants = require('../conf/constants.json')

module.exports = function container (get, set) {
  return new BFX().rest
}