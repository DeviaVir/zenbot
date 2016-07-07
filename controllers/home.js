module.exports = function container (get, set) {
  return get('controller')()
    .get('/', function (req, res, next) {
      get('db.logs').select({limit: 200, sort: {time: -1}}, function (err, logs) {
        if (err) return next(err)
        res.vars.logs = logs
        res.render('home')
      })
    })
}