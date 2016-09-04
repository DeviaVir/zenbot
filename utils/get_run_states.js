module.exports = function container (get, set, clear) {
  return function (cb) {
    get('run_states').select({
      query: {
        id: {
          $regex: /^zb_run/
        }
      }
    }, function (err, run_states) {
      if (err) return cb(err)
      run_states.sort(function (a, b) {
        if (a.exchange < b.exchange) return -1
        if (a.exchange > b.exchange) return 1
        if (a.asset < b.asset) return -1
        if (a.asset > b.asset) return 1
        if (a.currency < b.currency) return -1
        if (a.currency > b.currency) return 1
        return 0
      })
      cb(null, run_states)
    })
  }
}