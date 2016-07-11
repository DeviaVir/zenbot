var constants = require('../conf/constants.json')

module.exports = function container (get, set) {
  var filter_logs = get('utils.filter_logs')
  return get('controller')()
    .get('/logs', function (req, res, next) {
      var params = {
        limit: constants.log_limit,
        sort: {time: -1},
        skip: parseInt(req.query.skip, 10),
        query: {
          public: !res.vars.secret
        }
      }
      if (req.query.start) {
        params.query.time = {
          $gt: parseInt(req.query.start, 10)
        }
      }
      get('db.logs').select(params, function (err, logs) {
        if (err) return next(err)
        res.json({
          logs: filter_logs(logs, res)
        })
      })
    })
}