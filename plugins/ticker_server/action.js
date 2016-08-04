var z = require('zero-fill')

module.exports = function container (get, set, clear) {
  var c = get('zenbrain:config')
  return function action () {
    var app = get('app')
    app.listen(function (err) {
      if (err) throw err
      var port = get('motley:site.server').address().port
      get('logger').info(z(c.max_slug_length, 'ticker server', ' '), 'open'.grey, ('http://localhost:' + port + '/?period=' + c.default_graph_period + '&limit=' + c.default_graph_limit).yellow, 'to see a live graph.'.grey)
    })
  }
}