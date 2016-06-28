module.exports = {
  // meta
  _ns: 'motley',
  _folder: 'conf',

  '@db.mongo': {
    url: 'mongodb://localhost:27017/gdax_history',
    username: null,
    password: null
  },

  'product_id': 'BTC-USD',

  'tick_interval': 10000,
  'tick_size': '10s',

  'bot': {
    balance: {
      asset: 0,
      currency: 1000
    },
    min_vol: 140,
    min_trade: 0.01
  }
}