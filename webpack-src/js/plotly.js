var Plotly = require('plotly.js/lib/core')

Plotly.register([
  require('plotly.js/lib/bar'),
  require('plotly.js/lib/ohlc')
])

module.exports = Plotly