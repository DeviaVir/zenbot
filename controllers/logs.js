var constants = require('../conf/constants.json')

module.exports = function container (get, set) {
  return get('controller')()
    .get('/logs', function (req, res, next) {
      var params = {
        limit: constants.log_limit,
        sort: {time: -1},
        query: {
          public: !res.vars.secret
        }
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