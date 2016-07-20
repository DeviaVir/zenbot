module.exports = {
  asset: 'BTC', // or LTC, etc
  currency: 'USD', // or CNY, etc

  // change if your mongo server is not local
  db: {
    url: 'mongodb://localhost:27017/zenbot',
    username: null,
    password: null
  },

  // optional, for --tweet flag
  twitter: {
    key: '',
    secret: '',
    access_token: '',
    access_token_secret: ''
  },

  enabled_plugins: [
    'gdax'
  ]
}