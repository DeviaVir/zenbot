module.exports = function (input) {
  var date = input ? new Date(input) : new Date()
  var tzMatch = date.toString().match(/\((.*)\)/)
  var time = date.toLocaleString() + ' ' + tzMatch[1]
  if (time.match(/, [^0]:/)) {
    time = time.replace(', ', ', 0')
  }
  return time
}