module.exports = function container (get, set, clear) {
  return function reduce (options) {
    get('reducers').forEach(function (reducer) {
      reducer(options)
    })
  }
}