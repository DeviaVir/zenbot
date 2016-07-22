var price = n(tick.close)
          .add(n(tick.close).multiply(constants.markup))
          .value() // add markup
        var spend = n(rs.currency)
            .multiply(bot.trade_amt)
            .value()
        var fee = n(size)
          .multiply(price)
          .multiply(constants.fee)
          .value()
        var size = n(spend)
          .divide(price)
          .value()
        get('logger').info('brain', ('volume trigger ' + rs.side + ' ' + n(trigger_vol).format('0.0') + ' >= ' + n(bot.min_vol).format('0.0')).cyan, {data: {action: rs.side, trigger_vol: trigger_vol, min_vol: bot.min_vol}})
        if (spend / price < constants.min_trade_possible) {
          // would buy, but not enough funds
          get('logger').info('brain', ('not enough currency to buy!').red, {data: {actionspend: spend, price: price, size: spend / price, min_trade: constants.min_trade_possible, currency: rs.currency}})
          //rs.vol = 0
          return finish()
        }
        // rs.vol = 0
        // rs.max_vol = 0
        rs.buy_price = price
        rs.trade_vol = n(rs.trade_vol)
          .add(size)
          .value()
        rs.num_trades++
        rs.asset = n(rs.asset)
          .add(size)
          .value()
        rs.currency = n(rs.currency)
          .subtract(spend)
          .subtract(fee)
          .value()
        get('logger').info('brain', ('[bot] BUY ' + n(size).format('0.000') + ' ' + constants.asset + ' at ' + n(price).format('$0,0.00').cyan), {data: {action: 'BUY', size: size, asset: rs.asset, currency: rs.currency, price: price, fee: fee, num_trades: rs.num_trades, trade_vol: rs.trade_vol}})
        assert(rs.currency >= 0)
        assert(rs.asset >= 0)
        if (bot.trade && !bot.sim) {
          var buy_params = {
            type: 'market',
            size: n(size).format('0.000'),
            product_id: constants.product_id
          }
          client.buy(buy_params, function (err, resp, order) {
            onOrder(err, resp, order)
            syncBalance()
          })
        }