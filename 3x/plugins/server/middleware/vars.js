module.exports = function container (get, set, clear) {
  var c = get('zenbrain:config')
  return function (req, res, next) {
    res.vars.selectors = c.graph_selectors.map(function (selector) {
      return {
        selector: selector,
        is_default: req.query.selector ? req.query.selector == selector : selector === c.graph_selectors[0]
      }
    })
    res.vars.tick_sizes = c.reducer_sizes.map(function (size) {
      return {
        size: size,
        is_default: req.query.period ? req.query.period == size : size === c.default_graph_period
      }
    })
    res.vars.graph_limits = c.graph_limits.map(function (limit) {
      return {
        limit: limit,
        is_default: req.query.limit ? req.query.limit == limit : limit === c.default_graph_limit
      }
    })
    res.vars.sim_id = req.query.sim_id
    res.vars.tracking_scripts = c.tracking_scripts
    res.vars.user_agent = USER_AGENT
    res.vars.version = USER_AGENT.split('/')[1]
    next()
  }
}