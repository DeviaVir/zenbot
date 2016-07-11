var moment = require('moment')
require('moment-timezone')

module.exports = function (input) {
  return moment(input).format('MM/DD/YYYY hh:mm:ss A ') + moment.tz(moment.tz.guess()).format('z')
}