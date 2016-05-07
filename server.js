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
  exit(err)
}

function exit (err) {
  console.error(err)
  console.error(err.stack)
  process.exit(1)
}

app.listen(function (err) {
  if (err) exit(err)
  function onExit () {
    app.close(function (err) {
      if (err) exit(err)
    })
  }
  process.once('SIGINT', onExit)
  process.once('SIGTERM', onExit)
})