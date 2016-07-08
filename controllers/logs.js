var constants = require('../conf/constants.json')

module.exports = function container (get, set) {
  return get('controller')()
    .get('/logs', function (req, res, next) {
      get('db.logs').select({limit: constants.log_limit, sort: {time: -1}, skip: parseInt(req.query.skip, 10)}, function (err, logs) {
        if (err) return next(err)
        res.vars.logs = logs
        res.json(res.vars)
      })
    })
    .get('/logs/new', function (req, res, next) {
      get('db.logs').select({
        query: {
          time: {
            $gt: parseInt(req.query.start, 10)
          }
        },
        limit: constants.log_limit,
        sort: {
          time: -1
        }
      }, function (err, logs) {
        if (err) return next(err)
        res.vars.logs = logs
        res.json(res.vars)
      })
    })
}