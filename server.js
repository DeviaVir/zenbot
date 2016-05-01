var motley = require('motley')

try {
  var app = motley({
    _ns: 'motley',
    _maps: [
      require('./_codemap'),
      require('motley-templ'),
      require('motley-buffet')
      // require()'ed motley plugins go here.
    ]
  })
  app.listen(function (err) {
    if (err) return console.error(err)
  })
}
catch (err) {
  console.error(err)
  process.stderr.once('drain', function () {
    process.exit(1)
  });
}
