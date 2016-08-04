module.exports = function container (get, set, clear) {
  return function action () {
    var app = get('app')
    app.listen(function (err) {
      if (err) throw err
      var port = get('motley:site.server').address().port
      get('logger').info('ticker server', 'listening on port'.grey, port)
    })
  }
}