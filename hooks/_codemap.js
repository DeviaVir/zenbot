module.exports = {
  // meta
  _ns: 'motley',
  _folder: 'hooks',

  'ensure_indexes': require('./ensure_indexes'),
  '@mount': [
    '#hooks.ensure_indexes',
    '#db.mountCollections'
  ]
}