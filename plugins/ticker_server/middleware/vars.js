module.exports = function container (get, set, clear) {
  var c = get('zenbrain:config')
  return function (req, res, next) {
    res.vars.tick_sizes = [c.brain_speed].concat(c.reducer_sizes).map(function (size) {
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
    res.vars.exchanges = c.exchanges.map(function (exchange) {
      return {
        exchange: exchange,
        is_default: req.query.exchange ? req.query.exchange == exchange : exchange === c.exchanges[0]
      }
    })
    next()
  }
}