var z = require('zero-fill')

module.exports = function container (get, set, clear) {
  var c = get('zenbrain:config')
  var get_id = get('zenbrain:utils.get_id')
  return function action () {
    var app = get('app')
    var secret = get_id()
    set('@zenbrain:secret', secret)
    app.listen(function (err) {
      if (err) throw err
      var port = get('motley:site.server').address().port
      get('logger').info(z(c.max_slug_length, 'ticker server', ' '), 'open'.grey, ('http://localhost:' + port + '/?secret=' + secret).yellow, 'to see a live graph.'.grey)
    })
  }
}