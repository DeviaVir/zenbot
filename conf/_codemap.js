module.exports = {
  // meta
  _ns: 'motley',
  _folder: 'conf',

  // site overrides
  '@site.port': 3000,
  '@site.title': 'your new Motley site',

  // middleware overrides
  'middleware.session{}': {
    cookie: {
      maxAge: 86400 * 365 // session cookie lifetime: 1 year
    },
    key: 'motley' // change this to customize the session cookie name
  },
  'middleware.templ{}': {
    watch: true // watch for template changes and auto-recompile
  },
  'middleware.buffet{}': {
    watch: true // watch for file changes and auto-clear cache
  }
}