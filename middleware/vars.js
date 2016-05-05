module.exports = function container (get, set) {
  return function vars (req, res, next) {
    // access req or res here, before routes are run.
    res.vars.title = get('conf.site.title')
    res.vars.post = req.body
    res.vars.user = req.user
    next()
  }
}