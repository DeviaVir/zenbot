module.exports = {
  _ns: 'motley',
  _folder: 'utils',
  'authed_client': require('./authed_client'),
  'client': require('./client'),
  '@motley:console': require('./console'),
  'filter_logs': require('./filter_logs'),
  'get_time': require('./get_time'),
  'get_timestamp': require('./get_timestamp'),
  'twitter_client': require('./twitter_client'),
  'websocket': require('./websocket')
}