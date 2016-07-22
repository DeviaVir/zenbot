module.exports = function container (get, set, clear) {
  var apply_funcs = get('utils.apply_funcs')
  var rs = get('run_state')
  return {
    see: function (tick, cb) {
      var tasks = get('sensors')
      apply_funcs(tick, tasks, function (err) {
        if (err) return cb(err)
        cb()
      })
    },
    think: function (cb) {
      var tasks = get('thinkers')
      apply_funcs(rs, tasks, function (err) {
        if (err) return cb(err)
        cb()
      })
    }
  }
}