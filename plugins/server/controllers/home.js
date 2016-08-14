module.exports = function container (get, set) {
  var c = get('zenbrain:config')
  return get('controller')()
    .add(function (req, res, next) {
      if (req.query.secret && req.query.secret === get('zenbrain:secret')) {
        req.session.secret = req.query.secret
      }
      next()
    })
    .get('/', function (req, res, next) {
      res.render('home')
    })
    .add('/logs', '/logs/data', function (req, res, next) {
      if (!req.session.secret) {
        return next(new Error('access denied to ' + req.method + ' ' + req.url))
      }
      next()
    })
    .get('/logs', function (req, res, next) {
      res.render('logs')
    })
    .get('/logs/data', function (req, res, next) {
      var params = {
        query: {
          app: get('zenbrain:app_name')
        },
        limit: c.log_query_limit,
        sort: {time: -1}
      }
      if (req.query.newest_time) {
        params.query.time = {
          $gt: parseInt(req.query.newest_time, 10)
        }
      }
      else if (req.query.oldest_time) {
        params.query.time = {
          $lte: parseInt(req.query.oldest_time, 10)
        }
      }
      get('db.logs').select(params, function (err, logs) {
        if (err) return next(err)
        res.json({
          logs: logs
        })
      })
    })
}