var Twit = require('twit')

module.exports = function container (get, set) {
  var config = require('../config.js')
  return new Twit({
    consumer_key: config.twitter_key,
    consumer_secret: config.twitter_secret,
    access_token: config.twitter_access_token,
    access_token_secret: config.twitter_access_token_secret
  })
}