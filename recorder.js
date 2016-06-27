var motley = require('motley')

try {
  var app = motley({
    _ns: 'motley',
    _maps: [
      require('./_codemap'),
      require('motley-mongo')
    ],
    // disable http server
    '@site.mountMiddleware': function (cb) {
      setImmediate(cb)
    },
    '@site.listen': function (cb) {
      setImmediate(cb)
    },
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
      process.exit()
    })
  }
  process.once('SIGINT', onExit)
  process.once('SIGTERM', onExit)
})