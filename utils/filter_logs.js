module.exports = function container (get, set, clear) {
  return function (logs, res) {
    return logs.map(function (log) {
      if (!res.vars.secret && log.data) {
        var old_data = log.data
        log.data = {zmi: log.data.zmi, new_max_vol: old_data.new_max_vol}
      }
      return log
    })
  }
}