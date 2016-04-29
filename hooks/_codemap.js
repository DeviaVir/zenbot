module.exports = {
  // meta
  _ns: 'motley',
  _folder: 'hooks',

  // core hook registration
  'boot[]': function container (get, set) {
    return function task (cb) {
      // respond to the boot hook
      setImmediate(cb)
    }
  },
  'mount[]': function container (get, set) {
    return function task (cb) {
      // respond to the mount hook
      setImmediate(cb)
    }
  },
  'listen[]': function container (get, set) {
    return function task (cb) {
      // respond to the listen hook
      console.log('listening on http://localhost:' + get('site.server').address().port + '/')
      setImmediate(cb)
    }
  }
}