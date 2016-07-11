var Convert = require('ansi-to-html');
var convert = new Convert({
  fg: '#3ceb00',
  bg: '#000',
  newline: true,
  escapeXML: true,
  stream: false
})

module.exports = function container (get, set) {
  return get('db.createCollection')('logs', {
    load: function (obj, opts, cb) {
      // respond after the obj is loaded
      obj.html = convert.toHtml(obj.line)
      cb(null, obj);
    },
    save: function (obj, opts, cb) {
      // respond before the obj is saved
      cb(null, obj);
    },
    afterSave: function (obj, opts, cb) {
      // respond after the obj is saved
      cb(null, obj);
    },
    destroy: function (obj, opts, cb) {
      // respond after the obj is destroyed
      cb(null, obj)
    }
  })
}