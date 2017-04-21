module.exports = function container (get, set, clear) {
  var c = get('conf')
  return function (program) {
    program
      .command('watcher')
      .description('creates a long-running process to record trade data')
      .action(function () {
        var instances = {}
        var trades = get('db.trades')
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
          var opts = {product_id: this.product_id, newer: true, cursor: this.newest_id}
          this.exchange.getTrades(opts, function (err, trades) {
            if (err) {
              console.error('err watching selector: ' + self.selector)
              console.error(err)
              setTimeout(function () {
                self.watchNew()
              }, c.watcher_error_backoff)
              return
            }
            trades.forEach(function (trade) {
              self.saveTrade(trade)
            })
            console.log(self.selector, 'saved', trades.length, 'trades')
            self.newest_id = opts.cursor
            setTimeout(function () {
              self.watchNew()
            }, c.watcher_poll_new)
          })
        }
        WatcherInstance.prototype.saveTrade = function (trade) {
          var self = this
          trade.id = this.selector + '-' + String(trade.trade_id)
          if (this.saved[trade.id]) {
            console.error('warning: already saved ' + trade.id)
          }
          trade.selector = this.selector
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