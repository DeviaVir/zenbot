module.exports = {
  // meta
  _ns: 'motley',
  _folder: 'db',

  // named collections
  'messages': require('./messages'),

  // collection registration
  'collections[]': [
    '#db.messages'
    // add more collections here.
  ]
}