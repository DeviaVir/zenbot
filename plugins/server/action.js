var z = require('zero-fill')

module.exports = function container (get, set, clear) {
  var get_id = get('zenbrain:utils.get_id')
  return function action () {
    var c = get('zenbrain:config')
    var app = get('app')
    var secret = get_id()
    set('@zenbrain:secret', secret)
    app.listen(function (err) {
      if (err) throw err
      get('logger').info('server', USER_AGENT, 'booted!'.cyan)
      var port = get('motley:site.server').address().port
      get('logger').info('server', 'open'.grey, ('http://localhost:' + port + '/?secret=' + secret).yellow, 'to see a live graph.'.grey)
    })
  }
}