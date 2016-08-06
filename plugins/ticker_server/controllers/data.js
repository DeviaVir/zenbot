var moment = require('moment')
  , n = require('numbro')

module.exports = function container (get, set) {
  var c = get('zenbrain:config')
  return get('controller')()
    .get('/data.csv', function (req, res, next) {
      res.setHeader('Content-Type', 'text/csv')
      res.write('Time,Open,High,Low,Close,Volume,Caption\n')
      var exchange = req.query.exchange || c.exchanges[0]
      var query = {
        app: get('zenbrain:app_name'),
        size: req.query.period ? req.query.period : c.default_graph_period
      }
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
          var x = tick.data.trades.exchanges[exchange]
          if (!x) return
          var line = [
            tick.time,
            n(x.open).format('0.00'),
            n(x.high).format('0.00'),
            n(x.low).format('0.00'),
            n(x.close).format('0.00'),
            x.volume,
            c.currency_symbol + n(x.close).format(',0.00') + ' ' + c.asset + '/' + c.currency + ' (' + exchange.toUpperCase() + ')',
          ].join(',')
          res.write(line + '\n')
        })
        res.end()
      })
    })
}