module.exports = {
  // meta
  _ns: 'motley',
  _folder: 'conf',

  // site
  '@site.port': 3000,
  '@site.title': 'your new Motley site',

  // middleware
  'middleware.session{}': {
    cookie: {
      maxAge: 86400 * 365
    },
    key: 'motley'
  },
  'middleware.addr.proxies[]': '127.0.0.1'
}