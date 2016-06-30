module.exports = {
  // meta
  _ns: 'motley',
  _folder: 'db',
  'mems': require('./mems'),
  'ticks': require('./ticks'),
  'trades': require('./trades'),
  'collections[]': [
    '#db.mems',
    '#db.ticks',
    '#db.trades'
  ]
}