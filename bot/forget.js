module.exports = function container (get, set, clear) {
  get('db.mems').destroy('learned', function (err, destroyed) {
    if (err) throw err
    console.log(JSON.stringify(destroyed || null, null, 2))
    process.exit()
  })
  return null
}