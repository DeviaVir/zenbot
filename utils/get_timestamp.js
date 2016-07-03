module.exports = function (input) {
  var date = input ? new Date(input) : new Date()
  var tz_match = date.toString().match(/\((.*)\)/)
  var time = date.toLocaleString() + (tz_match ? ' ' + tz_match[1] : '')
  if (time.match(/, [^0]:/)) {
    time = time.replace(', ', ', 0')
  }
  return time
}