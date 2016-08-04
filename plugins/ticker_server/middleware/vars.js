module.exports = function container (get, set, clear) {
  var c = get('zenbrain:config')
  return function (req, res, next) {
    res.vars.tick_sizes = c.reducer_sizes.map(function (size) {
      return {
        size: size,
        is_default: size === c.default_graph_period || req.query.period == size
      }
    })
    res.vars.graph_limits = c.graph_limits.map(function (limit) {
      return {
        limit: limit,
        is_default: limit === c.default_graph_limit || req.query.limit == limit
      }
    })
    next()
  }
}