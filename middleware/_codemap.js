module.exports = {
  // meta
  _ns: 'motley',
  _folder: 'middleware',

  // register handlers with weights
  'handlers[-5]': function container (get, set) {
    return function handler (req, res, next) {
      // access req or res here, before routes are run.
      res.vars.title = get('conf.site.title')
      next()
    }
  }
}