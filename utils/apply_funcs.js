module.exports = function container (get, set, clear) {
  return function apply_funcs (item, funcs, cb) {
    funcs = funcs.slice()
    ;(function doNext () {
      var curr = funcs.shift()
      if (!curr) return cb()
      curr(item, function (err) {
        if (err) return cb(err)
        doNext()
      })
    })()
  }
}