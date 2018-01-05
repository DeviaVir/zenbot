

module.exports = function container (get) {
  let c = get('conf')
  let express = require('express')
  let app = express()
  let random_port = require('random-port')
  let path = require('path')

  let run = function(reporter, tradeObject) {
    if (!reporter.port || reporter.port === 0) {
      random_port({from: 20000}, function(port) {
        startServer(port, tradeObject)
      })
    } else {
      startServer(reporter.port, tradeObject)
    }
  }

  let objectWithoutKey = (object, key) => {
    const {[key]: deletedKey, ...otherKeys} = object;
    return otherKeys;
  };

  let startServer = function(port, tradeObject) {
    tradeObject.port = port

    app.set('views', path.join(__dirname+'../../../templates'));
    app.set('view engine', 'ejs');

    app.use('/assets', express.static(__dirname+'../../../templates/dashboard_assets'));
    app.use('/assets-wp', express.static(__dirname+'../../../dist/'));
    app.use('/assets-zenbot', express.static(__dirname+'../../../assets'));

    app.get('/', function (req, res) {
      let datas = objectWithoutKey(tradeObject, 'options');
      datas = objectWithoutKey(tradeObject, 'lookback');
      res.render('dashboard', datas);
    });

    app.get('/trades', function (req, res) {
      res.send(objectWithoutKey(tradeObject, 'options'));
    });

    app.get('/stats', function (req, res) {
      res.sendFile(path.join(__dirname+'../../../stats/index.html'));
    });

    app.listen(port)
    tradeObject.url = require('ip').address() + ':' + port + '/'
    console.log('Web GUI running on http://' + tradeObject.url)
  }

  return {
    run: run
  }
}
