var moment = require('moment')
  , n = require('numbro')

module.exports = function container (get, set) {
  var c = get('zenbrain:config')
  return get('controller')()
    .get('/data.csv', function (req, res, next) {
      res.setHeader('Content-Type', 'text/csv')
      res.write('Time,Open,High,Low,Close,Volume,Close_str,Exchange\n')
      var exchange = req.query.exchange || c.exchanges[0]
      var query = {
        app_name: get('zenbrain:app_name'),
        size: req.query.period ? req.query.period : c.default_graph_period
      }
      query['trades.exchanges.' + exchange] = {
        $exists: true
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
          var date = moment(tick.time).format('D-MMM-YY')
          var line = [
            tick.time,
            n(tick.trades.exchanges[exchange].open).format('0.00'),
            n(tick.trades.exchanges[exchange].high).format('0.00'),
            n(tick.trades.exchanges[exchange].low).format('0.00'),
            n(tick.trades.exchanges[exchange].close).format('0.00'),
            tick.trades.exchanges[exchange].vol,
            c.currency_symbol + n(tick.trades.exchanges[exchange].close).format(',0.00'),
            exchange.toUpperCase()
          ].join(',')
          res.write(line + '\n')
        })
        res.end()
      })
    })
}