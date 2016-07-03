module.exports = function container (get, set, clear) {
  var bot = get('bot')
  get('db.mems').load('learned', function (err, learned) {
    if (err) throw err
    console.log(JSON.stringify(learned, null, 2))
    setTimeout(process.exit, 1000)
  })
  return null
}