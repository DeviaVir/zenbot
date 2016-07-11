var constants = require('../conf/constants.json')

module.exports = function container (get, set) {
  return get('controller')()
    .get('/', function (req, res, next) {
      res.render('home')
    })
    .get('/forget', function (req, res, next) {
      delete req.session.secret
      res.redirect('/')
    })
}