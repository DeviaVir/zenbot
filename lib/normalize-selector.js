module.exports = function (selector) {
  var parts = selector.split('.')
  return parts[0].toLowerCase() + '.' + (parts[1] || '').toUpperCase()
}