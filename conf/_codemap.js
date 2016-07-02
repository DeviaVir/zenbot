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

  'gdax': function container (get, set) {
    try {
      return require('../config.js')
    }
    catch (e) {
      return {}
    }
  },
  'sim': {
    query_limit: 100
  },
  'bot': {
    balance: {
      asset: 0,
      currency: 1000
    },
    min_vol: 150,
    trade_amt: 0.70,
    min_trade: 0.01,
    sim: process.argv[2] !== '--real',
    markup: 0.0002,
    fee: 0.0025,
    cooldown: 3,
    crash_protection: 0.046,
    sell_for_less: 0.08,
    buy_for_more: 0.15,
    vol_reset: 999
  }
}
