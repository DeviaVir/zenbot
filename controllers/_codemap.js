module.exports = {
  // meta
  _ns: 'motley',

  'controllers[]': [
    require('./auth'),
    require('./home'),
    require('./test')
    // add more controllers here.
  ]
}