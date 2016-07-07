module.exports = {
  // meta
  _ns: 'motley',

  // named middleware
  'middleware.secret': require('./secret'),
  'middleware.vars': require('./vars'),

  // register handlers with weights
  'middleware[]': [
    '#middleware.secret',
    '#middleware.vars'
  ]
}