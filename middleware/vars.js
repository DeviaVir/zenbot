module.exports = function container (get, set) {
  return function handler (req, res, next) {
    res.vars.title = res.vars.secret ? ZENBOT_USER_AGENT : ZENBOT_USER_AGENT.split('/')[0]
    next()
  }
}