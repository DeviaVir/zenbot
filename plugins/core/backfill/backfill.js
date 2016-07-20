module.exports = function container (get, set, clear) {
  return function backfill (options) {
    get('backfillers').forEach(function (backfiller) {
      backfiller(options)
    })
  }
}