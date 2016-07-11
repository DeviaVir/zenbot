module.exports = function container (get, set, clear) {
  return function (logs, res) {
    return logs.map(function (log) {
      if (!res.vars.secret && log.data) {
        var old_data = log.data
        log.data = {zmi: log.data.zmi}
        if (old_data.rs) {
          log.data.rs = {
            new_max_vol: old_data.rs.new_max_vol
          }
        }
      }
      return log
    })
  }
}