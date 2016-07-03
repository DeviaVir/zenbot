var moment = require('moment')
require('moment-timezone')

module.exports = function (input) {
  var m = moment(input)
  var str = m.format('h')
  var minute = m.format('mm')
  if (minute !== '00') str += ':' + minute
  str += m.format('a')
  str += ' ' + moment.tz(moment.tz.guess()).format('z')
  return str
}