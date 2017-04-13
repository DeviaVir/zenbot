module.exports = {
  _ns: 'zenbrain',
  _maps: [
    require('./bitfinex/_codemap'),
    require('./gdax/_codemap'),
    require('./kraken/_codemap'),
    require('./poloniex/_codemap'),
    require('./server/_codemap')
  ]
}