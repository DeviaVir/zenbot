module.exports = {
  // meta
  _ns: 'motley',

  // named middleware
  'middleware.secret': require('./secret'),

  // register handlers with weights
  'middleware[]': [
    '#middleware.secret'
  ]
}