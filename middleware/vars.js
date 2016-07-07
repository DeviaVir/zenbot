module.exports = function container (get, set) {
  return function handler (req, res, next) {
    res.vars.title = get('conf.site.title')
    next()
  }
}