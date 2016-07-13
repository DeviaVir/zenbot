module.exports = {
  _ns: 'motley',
  _folder: 'db',
  'logs': require('./logs'),
  'mems': require('./mems'),
  'ticks': require('./ticks'),
  'trades': require('./trades'),
  'collections[]': [
    '#db.logs',
    '#db.mems',
    '#db.ticks',
    '#db.trades'
  ]
}