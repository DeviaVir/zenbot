module.exports = {
  // meta
  _ns: 'motley',
  _folder: 'db',
  'mems': require('./mems'),
  'ticks': require('./ticks'),
  'collections[]': [
    '#db.mems',
    '#db.ticks'
  ]
}