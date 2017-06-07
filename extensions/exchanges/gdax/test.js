var Gdax = require('gdax')
var c = require('../../../conf')
var client = new Gdax.AuthenticatedClient(c.gdax.key, c.gdax.b64secret, c.gdax.passphrase, c.gdax.apiURI)

var order_id = 'd63a349d-0a0e-40f5-8ddb-83f8dc23441a'

client.getOrder(order_id, function (err, resp, body) {
  if (err) console.error(err)
  else if (resp.statusCode === 404) {
    console.error('NotFound')
  }
  else {
    console.log(body)
  }
})