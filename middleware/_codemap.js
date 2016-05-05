module.exports = {
  // meta
  _ns: 'motley',

  // named middleware
  'middleware.vars': require('./vars'),

  // middleware registration
  'middleware[]': [
    '#middleware.vars'
    // add more middleware here.
  ]
}