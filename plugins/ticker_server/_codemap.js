'@motley:conf.site.port': options.port || constants.listen_port,

if (mode === 'server') {
      rootMap._maps.push(require('motley-templ'), require('motley-buffet'))
      rootMap['@motley:conf.middleware.templ.root'] = {
        globs: [
          'views/**/*.hbs',
          'views/**/*.handlebars'
        ],
        cwd: path.resolve(__dirname, '..')
      }
      rootMap['@motley:conf.middleware.buffet.root'] = {
        globs: 'public/**/*',
        cwd: path.resolve(__dirname, '..')
      }
    }