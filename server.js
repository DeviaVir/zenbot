var motley = require('motley')

try {
  var app = motley({
    _ns: 'motley',
    _maps: [
      require('./_codemap'),
      require('motley-buffet'),
      require('motley-templ')
      // require()'ed motley plugins go here.
    ]
  })
}
catch (err) {
  console.error(err)
  console.error(err.stack)
  process.exit(1)
}

app.listen(function (err) {
  if (err) {
    console.error(err)
    console.error(err.stack)
    process.exit(1)
  }
  function onExit () {
    app.close(function (err) {
      if (err) {
        console.error(err)
        console.error(err.stack)
        process.exit(1)
      }
    })
  }
  process.once('SIGINT', onExit)
  process.once('SIGTERM', onExit)
})