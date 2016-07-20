module.exports = function container (get, set, clear) {
  return function backfill (options) {
    get('recorders').forEach(function (recorder) {
      recorder(options)
    })
  }
}