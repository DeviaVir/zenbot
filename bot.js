var motley = require('motley')

try {
  var app = motley({
    _ns: 'motley',
    _maps: [
      require('./_codemap'),
      require('motley-mongo')
    ],
    '@hooks.mount': [
      '#db.mountCollections',
      '#hooks.mountBot'
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

app.mount(function (err) {
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