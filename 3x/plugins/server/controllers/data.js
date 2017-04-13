var moment = require('moment')
  , n = require('numbro')
  , o = require('object-get')

module.exports = function container (get, set) {
  var format_currency = get('zenbrain:utils.format_currency')
  return get('controller')()
    .get('/sim_trades.csv', function (req, res, next) {
      res.setHeader('Content-Type', 'text/csv')
      res.write('Type,Time,Asset,Currency,Exchange,Price,Size,RSI,ROI\n')
      if (!req.session.secret) {
        return res.end()
      }
      get('db.run_states').load(req.query.sim_id, function (err, sim_result) {
        if (err) return next(err)
        if (sim_result && sim_result.actions) {
          sim_result.actions.forEach(function (action) {
            var line = [
              action.type,
              action.time,
              action.asset,
              action.currency,
              action.exchange,
              action.price,
              action.size,
              action.rsi,
              action.roi
            ].join(',')
            res.write(line + '\n')
          })
        }
        res.end()
      })
    })
    .get('/trades.csv', function (req, res, next) {
      res.setHeader('Content-Type', 'text/csv')
      res.write('Type,Time,Asset,Currency,Exchange,Price,Size,RSI,ROI\n')
      if (!req.session.secret) {
        return res.end()
      }
      get('db.run_states').load(get('zenbrain:app_name') + '_run', function (err, run_state) {
        if (err) return next(err)
        if (run_state && run_state.actions) {
          run_state.actions.forEach(function (action) {
            var line = [
              action.type,
              action.time,
              action.asset,
              action.currency,
              action.exchange,
              action.price,
              action.size,
              action.rsi,
              action.roi
            ].join(',')
            res.write(line + '\n')
          })
        }
        res.end()
      })
    })
    .get('/data.csv', function (req, res, next) {
      var c = get('zenbrain:config')
      res.setHeader('Content-Type', 'text/csv')
      res.write('Time,Open,High,Low,Close,Volume,Caption\n')
      var selector = req.query.selector ? req.query.selector : c.default_selector
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
          var line = [
            tick.time,
            n(x.open).format('0.00000000'),
            n(x.high).format('0.00000000'),
            n(x.low).format('0.00000000'),
            n(x.close).format('0.00000000'),
            x.volume,
            format_currency(x.close, currency) + ' ' + asset + '/' + currency + ' (' + exchange + ')'
          ].join(',')
          res.write(line + '\n')
        })
        res.end()
      })
    })
}