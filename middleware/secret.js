module.exports = function container (get, set) {
  return function handler (req, res, next) {
    req.bot = get('zenbot:bot')
    if (!req.bot.secret) return next()
    if (req.session.secret && req.session.secret === req.bot.secret) {
      res.vars.secret = true
      return next()
    }
    if (req.query.secret) {
      if (req.query.secret !== req.bot.secret) {
        return next(new Error('bad secret'))
      }
      req.session.secret = req.query.secret
      res.vars.secret = true
    }
    next()
  }
}