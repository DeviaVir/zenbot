var ansi_up = require('ansi_up')

module.exports = function container (get, set) {
  return get('db.createCollection')('logs', {
    load: function (obj, opts, cb) {
      // respond after the obj is loaded
      obj.html = ansi_up.linkify(ansi_up.ansi_to_html(ansi_up.escape_for_html(obj.line), {use_classes: true}))
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