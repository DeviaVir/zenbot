var idgen = require('idgen')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  var c = get('conf')
  return function (program) {
    program
      .command('watcher')
      .description('creates a long-running process to record trade data')
      .action(function () {
        var instances = {}
        var trades = get('db.trades')
        var resume_markers = get('db.resume_markers')
        get('db.mongo').collection('resume_markers').ensureIndex({selector: 1, to: -1})
        function pollSelectors () {
          // adjust on-the-fly for selector changes.
          get('db.selectors').select(function (err, watching) {
            if (err) throw err
            var old_selectors = {}
            Object.keys(instances).forEach(function (selector_id) {
              old_selectors[selector_id] = true
            })
            watching.forEach(function (selector) {
              if (!instances[selector.id]) {
                // new watcher instance.
                instances[selector.id] = new WatcherInstance(selector.id)
              }
              delete old_selectors[selector.id]
            })
            Object.keys(old_selectors).forEach(function (selector_id) {
              // shut down old instances.
              instances[selector_id].close()
              delete instances[selector_id]
            })
          })
        }
        function WatcherInstance (selector_id) {
          this.selector = selector_id
          this.exchange_id = this.selector.split('.')[0]
          this.product_id = this.selector.split('.')[1]
          this.exchange = get('exchanges.' + this.exchange_id)
          this.saved = {}
          this.marker = {
            id: idgen(),
            selector: this.selector,
            from: null,
            to: null,
            oldest_time: null
          }
          if (!this.exchange) {
            console.error('cannot watch ' + selector_id + ': exchange not implemented')
            return
          }
          this.init()
        }
        WatcherInstance.prototype.init = function () {
          console.log('begin watching ' + this.selector)
          this.watchNew()
        }
        WatcherInstance.prototype.watchNew = function () {
          var self = this
          if (this.closed) {
            console.log('end watching ' + this.selector)
            return
          }
          var opts = {product_id: self.product_id, from: self.marker.to}
          self.exchange.getTrades(opts, function (err, trades) {
            if (err) {
              console.error('err watching selector: ' + self.selector)
              console.error(err)
              setTimeout(function () {
                self.watchNew()
              }, c.watcher_error_backoff)
              return
            }
            trades.sort(function (a, b) {
              if (a.time < b.time) return -1
              if (a.time > b.time) return 1
              return 0
            })
            var size_total = 0
            trades.forEach(function (trade) {
              self.saveTrade(trade)
              size_total += trade.size
            })
            if (trades.length) {
              console.log(self.selector, 'saved ' + trades.length + ' trades totalling', n(size_total).format('0.00'), self.product_id.split('-')[0])
            }
            resume_markers.save(self.marker, function (err) {
              if (err) {
                console.error('err saving marker')
                console.error(marker)
              }
              setTimeout(function () {
                self.watchNew()
              }, c.watcher_poll_new)
            })
          })
        }
        WatcherInstance.prototype.saveTrade = function (trade) {
          var self = this
          trade.id = self.selector + '-' + String(trade.trade_id)
          if (self.saved[trade.id]) {
            console.error('warning: already saved ' + trade.id)
          }
          trade.selector = self.selector
          var cursor = self.exchange.getCursor(trade)
          if (!self.marker.from) {
            self.marker.from = cursor
            self.marker.oldest_time = trade.time
          }
          self.marker.to = self.marker.to ? Math.max(self.marker.to, cursor) : cursor
          trades.save(trade, function (err) {
            if (err) {
              console.error('err saving trade')
              console.error(trade)
            }
            else {
              self.saved[trade.id] = true
            }
          })
        }
        WatcherInstance.prototype.close = function () {
          this.closed = true
        }
        pollSelectors()
        setInterval(pollSelectors, c.watcher_poll_selectors)
      })
  }
}