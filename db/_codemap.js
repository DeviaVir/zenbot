module.exports = {
  // meta
  _ns: 'motley',
  _folder: 'db',

  // named collections
  'users': require('./users'),

  // collection registration
  'collections[]': ['#db.users']
}