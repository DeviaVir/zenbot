module.exports = {
  // meta
  _ns: 'motley',
  _folder: 'db',

  // named collections
  'ticks': require('./ticks'),
  'trades': require('./trades'),

  // collection registration
  'collections[]': [
    '#db.ticks',
    '#db.trades'
    // add more collections here.
  ]
}