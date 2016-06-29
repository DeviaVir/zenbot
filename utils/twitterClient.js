var Twit = require('twit')

module.exports = function container (get, set) {
  var conf = get('conf.gdax')
  return new Twit({
    consumer_key: conf.twitterKey,
    consumer_secret: conf.twitterSecret,
    access_token: conf.twitterAccessToken,
    access_token_secret: conf.twitterAccessTokenSecret
  })
}