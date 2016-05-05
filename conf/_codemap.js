module.exports = {
  // meta
  _ns: 'motley',
  _folder: 'conf',

  // site overrides
  '@site.port': 3000,
  '@site.title': 'your new Motley site',

  // middleware overrides
  'middleware.templ{}': {
    watch: true
  },
  'middleware.buffet{}': {
    watch: true
  },

  // other variables
  'auth.strength': 12
}