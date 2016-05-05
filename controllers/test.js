module.exports = function container (get, set) {
  return get('controller')()
    .get('/test.html', function (req, res, next) {
      res.render('test')
    })
}