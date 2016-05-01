module.exports = {
  // meta
  _ns: 'motley',
  _folder: 'conf',

  // site
  '@site.port': 3000,
  '@site.title': 'your new Motley site',

  // middleware
  'middleware.buffet{}': {
    indexes: true,
    index: 'index.html',
    watch: true,
    notFoundPath: '/404.html',
    defaultContentType: 'application/octet-stream'
  }
}