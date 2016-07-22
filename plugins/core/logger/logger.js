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
      var slug = args.shift()
      var slug_colors = [
        'yellow',
        'blue',
        'magenta',
        'cyan',
        'white'
      ]
      var hash_val = crypto.createHash('sha1').update(slug).digest().readInt8() + 127
      var color_idx = Math.floor((hash_val / 255) * slug_colors.length)
      slug = ('[' + slug + ']')[slug_colors[color_idx]]
      args.unshift(slug)
      this._log(args)
    },
    error: function () {
      var args = [].slice.call(arguments)
      var msg = '[ERROR]'.red
      args.unshift(msg)
      this._log(args)
    }
  }
}
