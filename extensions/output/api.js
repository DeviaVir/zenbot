

module.exports = function container (get) {
  let c = get('conf')
  let express = require('express')
  let app = express()
  let random_port = require('random-port')

  let run = function(reporter, tradeObject) {
    if (!reporter.port || reporter.port === 0) {
      random_port({from: 20000}, function(port) {
        startServer(port, tradeObject)
      })
    } else {
      startServer(reporter.port, tradeObject)
    }
  }

  let startServer = function(port, tradeObject) {
    tradeObject.port = port

    app.get('/trades', function (req, res) {
      res.send(tradeObject)
    })

    app.listen(port)
    tradeObject.url = require('ip').address() + ':' + port + '/trades'
    console.log('api running on ' + tradeObject.url)
  }

  return {
    run: run
  }
}
