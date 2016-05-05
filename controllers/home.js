module.exports = function container (get, set) {
  return get('controller')()
    .get('/', function (req, res, next) {
      res.vars.welcome = 'to ' + get('conf.site.title') + '!'
      res.vars.version = require('../package.json').version
      res.vars.core = require('motley/package.json').version
      res.render('index')
    })
}