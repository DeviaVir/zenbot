var moment = require('moment')
  , n = require('numbro')
  , o = require('object-get')

module.exports = function container (get, set) {
  var c = get('zenbrain:config')
  var get_currency_format = get('zenbrain:utils.get_currency_format')
  return get('controller')()
    .get('/data.csv', function (req, res, next) {
      res.setHeader('Content-Type', 'text/csv')
      res.write('Time,Open,High,Low,Close,Volume,Caption\n')
      var selector = req.query.selector ? req.query.selector : c.graph_selectors[0]
      var exchange = selector.split('.')[0].toUpperCase()
      var query = {
        app: get('zenbrain:app_name'),
        size: req.query.period ? req.query.period : c.default_graph_period
      }
      query['data.trades.' + selector] = {$exists: true}
      get('db.ticks').select(
      {
        query: query,
        sort: {
          time: -1
        },
        limit: req.query.limit ? parseInt(req.query.limit, 10) : c.default_graph_limit
      }, function (err, ticks) {
        if (err) return next(err)
        ticks.forEach(function (tick) {
          var x = o(tick, 'data.trades.' + selector)
          var currency = selector.split('-')[1]
          var asset = selector.split('.')[1].split('-')[0]
          var format = get_currency_format(currency)
          var line = [
            tick.time,
            n(x.open).format('0.00'),
            n(x.high).format('0.00'),
            n(x.low).format('0.00'),
            n(x.close).format('0.00'),
            x.volume,
            n(x.close).format(format) + ' ' + asset + '/' + currency + ' (' + exchange + ')'
          ].join(',')
          res.write(line + '\n')
        })
        res.end()
      })
    })
}