module.exports = function container (get, set, clear) {
  return function setup () {
    var app = get('app')
    var options = get('options')
    var adds = {
      _ns: 'motley',
      _maps: [
        require('motley-templ'),
        require('motley-buffet')
      ],
      '@conf.site.port': options.port,
      '@conf.middleware.templ.root': {
        globs: [
          'views/**/*.hbs',
          'views/**/*.handlebars'
        ],
        cwd: __dirname
      },
      '@conf.middleware.buffet.root': {
        globs: 'public/**/*',
        cwd: __dirname
      }
    }
    app.use(adds)
  }
}