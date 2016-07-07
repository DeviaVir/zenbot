module.exports = {
  // meta
  _ns: 'motley',
  _folder: 'db',
  'logs': require('./logs'),
  'mems': require('./mems'),
  'ticks': require('./ticks'),
  'collections[]': [
    '#db.logs',
    '#db.mems',
    '#db.ticks'
  ]
}