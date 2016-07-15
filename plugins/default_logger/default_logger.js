var crypto = require('crypto')
  , colors = require('colors')

module.exports = function container (get, set) {
  var get_timestamp = get('utils.get_timestamp')
  var get_id = get('utils.get_id')
  return {
    _log: function (args) {
      var options = {}
      if (toString.call(args[args.length - 1]) === '[object Object]') {
        options = args.pop()
      }
      var time = new Date().getTime()
      args.unshift(get_timestamp(time).grey)
      var line = args.map(function (arg) {
        if (typeof arg !== 'string') {
          return JSON.stringify(arg, null, 2)
        }
        return arg
      }).join(' ')
      console.error(line)
      var log = {
        id: get_id(),
        time: time,
        line: line,
        data: options.data || null,
        public: options.public || false
      }
      try {
        get('motley:db.logs').save(log, function (err, saved) {
          // nothing
        })
      }
      catch (e) {}
    },
    info: function () {
      var args = [].slice.call(arguments)
      this._log(args)
    },
    error: function () {
      var args = [].slice.call(arguments)
      var msg = '[ERROR]'
      if (conf.colors) msg = colors.red(msg)
      args.unshift(msg)
      this._log(args)
    }
  }
}