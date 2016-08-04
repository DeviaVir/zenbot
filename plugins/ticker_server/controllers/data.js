var moment = require('moment')

module.exports = function container (get, set) {
  return get('controller')()
    .get('/data.csv', function (req, res, next) {
      res.setHeader('Content-Type', 'text/csv')
      res.write('Time,Open,High,Low,Close,Volume\n')
      get('db.ticks').select(
      {
        query: {
          app_name: get('zenbrain:app_name'),
          size: req.query.period ? req.query.period : '15m'
        },
        sort: {
          time: -1
        },
        limit: req.query.limit ? parseInt(req.query.limit, 10) : 200
      }, function (err, ticks) {
        if (err) return next(err)
        ticks.forEach(function (tick) {
          var date = moment(tick.time).format('D-MMM-YY')
          var line = [
            tick.time,
            tick.trades.open,
            tick.trades.high,
            tick.trades.low,
            tick.trades.close,
            tick.trades.vol
          ].join(',')
          res.write(line + '\n')
        })
        res.end()
      })
    })
}