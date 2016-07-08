module.exports = function container (get, set) {
  return function handler (req, res, next) {
    return next()
    // secret disabled for now
    req.bot = get('bot')
    if (!req.bot.secret) return next()
    if (req.session.secret && req.session.secret === req.bot.secret) return next()
    if (!req.query.secret) return next(new Error('secret required'))
    if (req.query.secret !== req.bot.secret) return next(new Error('bad secret'))
    req.session.secret = req.query.secret
    next()
  }
}