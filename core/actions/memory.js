var constants = require('../../conf/constants.json')
  , assert = require('assert')

module.exports = function container (get, set, clear) {
  return function memory (options) {
    var c = get('config')
    var options = get('options')

    var sMatch = c.default_selector.match(/^([^\.]+)\.([^-]+)-([^-]+)$/)
    assert(sMatch)
    var exchange = sMatch[1]
    var asset = sMatch[2]
    var currency = sMatch[3]
    var currencyPair = currency + '_' + asset
    //var bot = get('bot')
    var resp = {}
    var get_timestamp = get('utils.get_timestamp')
    //get('mems').load(c.default_selector, function (err, rs) {
    if (options.showall) {
      var allmems = get('mems')
      console.log(allmems)
    }

    if (options.create_pair) {
          //test = {}
          var pairs = {
            id: currencyPair,
            wasthisit: options.create_pair,
            time: new Date().getTime()
          }
          get('mems').load(constants.product_id, function (err, pairs) {
          //get('mems').load(currencyPair, function (err, rs) {
            if (err) throw err

              get('mems').load('pairs', function (err, pairs) {
                if (err) throw err
                if (!pairs) {
                  pairs = {
                    id: currencyPair,
                    wasthisit: 11,
                    time: new Date().getTime()
                  }
                }
                get('mems').save(pairs, function (err, saved) {
                  if (err) throw err
                })
            })
          })

           //pairs.id = 'currency pairs' 
           //pairs.doge = 'BTC_DOGE' 
/*
          get('mems').load(currencyPair, function (err, rs) {

            get('mems').load('pairs', function (err, pairs) {
               var pairs = {
                "id": "ass",
                "shit": "fuck",
                "you": "dick"
               }

              pairs.id = 'currency pairs' 
              pairs.doge = 'BTC_DOGE'
               var fuck = {}

              fuck.id = 'currency pairs' 
              fuck.doge = 'BTC_DOGE'

              //options.create_pair
              get('mems').save(pairs, function (err, saved) {
                if (err) throw err
              })
            })
          })
*/

          get('mems').load(currencyPair, function (err, pairs) {
          //get('mems').load(currencyPair, function (err, rs) {
            if (err) throw err
            get('mems').load('pairs', function (err, pairs) {
              if (err) throw err
              resp.rs = pairs
            })
            get('mems').load('rs', function (err, rs) {
              if (err) throw err
              resp.pairs = rs
            })

            get('mems').load('learned', function (err, learned) {
              if (err) throw err
              resp.learned = learned
              get('ticks').select({limit: 1, sort: {time: 1}}, function (err, ticks) {
                if (err) throw err
                if (ticks.length) {
                  resp.first_timestamp = get_timestamp(ticks[0].time)
                }
                else {
                  resp.first_timestamp = null
                }
                 get('ticks').select({limit: 1, sort: {time: -1}}, function (err, ticks) {
                  if (err) throw err
                  if (ticks.length) {
                    resp.last_timestamp = get_timestamp(ticks[0].time)
                  }
                  else {
                    resp.last_timestamp = null
                  }
                  console.log(JSON.stringify(resp, null, 2))
                  setTimeout(process.exit, 1000)
                })
              })
            })
          })

    }
    else {
      get('mems').load(c.default_selector, function (err, rs) {
      //get('mems').load(currencyPair, function (err, rs) {
        if (err) throw err
        resp.rs = rs
        get('mems').load('learned', function (err, learned) {
          if (err) throw err
          resp.learned = learned
          get('ticks').select({limit: 1, sort: {time: 1}}, function (err, ticks) {
            if (err) throw err
            if (ticks.length) {
              resp.first_timestamp = get_timestamp(ticks[0].time)
            }
            else {
              resp.first_timestamp = null
            }
             get('ticks').select({limit: 1, sort: {time: -1}}, function (err, ticks) {
              if (err) throw err
              if (ticks.length) {
                resp.last_timestamp = get_timestamp(ticks[0].time)
              }
              else {
                resp.last_timestamp = null
              }
              console.log(JSON.stringify(resp, null, 2))
              setTimeout(process.exit, 1000)
            })
          })
        })
      })
    }










    return null
  }
}