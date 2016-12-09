module.exports = function container (get, set, clear) {
  //var bot = get('zenbot')
    return function forget (options) {
      var c = get('config')
      var options = get('options')

      if(options.learned) {
        get('mems').destroy(c.default_selector, function (err, destroyed) {

          if (err) throw err
          else {
            console.log('The following learned params for ' + c.default_selector + ' was deleted: ')
            console.log(JSON.stringify(destroyed || null, null, 2))
            process.exit()
          }
        })
      }
      return null

    throw new Error('expected flag')
  }
}