module.exports = function container (get, set) {
  return function ensure_indexes (cb) {
    var tasks = []
    tasks.push(function (done) {
      get('db.mongo.db').collection('ticks').ensureIndex({time: 1}, done)
    })
    tasks.push(function (done) {
      get('db.mongo.db').collection('ticks').ensureIndex({complete: 1}, done)
    })
    tasks.push(function (done) {
      get('db.mongo.db').collection('logs').ensureIndex({time: -1}, done)
    })
    tasks.push(function (done) {
      get('db.mongo.db').collection('trades').ensureIndex({processed: 1}, done)
    })
    get('vendor.run-series')(tasks, cb)
  }
}