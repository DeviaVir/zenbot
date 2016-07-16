module.exports = function container (get, set, clear) {
  return function (id, options) {
    get('motley:db.run_states').destroy(id, function (err, destroyed) {
      if (err) throw err
      get('logger').info('[forgetter]'.yellow + ' forgot '.grey + id.cyan, destroyed, {public: false})
      get('app').close(function (err) {
        if (err) throw err
        process.exit()
      })
    })
  }
}