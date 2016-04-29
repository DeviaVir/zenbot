module.exports = {
  // meta
  _ns: 'motley',
  _folder: 'routes',

  // named routes ('@' prefix overrides a core route)
  '@home': require('./home'),

  // stack definition
  'handlers[0]': '#motley:routes.home'
}