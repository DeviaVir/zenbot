module.exports = function container (get, set) {
  return function vars (req, res, next) {
    // access req or res here, before routes are run.
    res.vars.title = get('conf.site.title')
    res.vars.post = req.body
    res.vars.user = req.user
    res.vars.nonce = Math.random()
    res.vars.welcome = 'to ' + get('conf.site.title') + '!'
    res.vars.version = require('../package.json').version
    res.vars.core = require('motley/package.json').version
    next()
  }
}