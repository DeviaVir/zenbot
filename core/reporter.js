if (first_report) {
      var ts = is_sim ? '             SIM DATE      ' : ''
      console.error(('DATE                       PRODUCT GRAPH                  PRICE     ZMI' + ts + '             ' + config.asset + '      ' + config.currency + '        BALANCE    DIFF       TRADED').white)
      first_report = false
    }
    rs.net_worth = n(rs.currency)
      .add(n(rs.asset).multiply(rs.last_tick.close))
      .value()
    var diff = n(rs.net_worth).subtract(rs.start_balance)
      .value()
    if (diff > 0) diff = z(9, '+' + n(diff).format('$0.00'), ' ').green
    if (diff === 0) diff = z(9, n(diff).format('$0.00'), ' ').white
    if (diff < 0) diff = (z(9, n(diff).format('$0.00'), ' ')).red
    var zmi = colors.strip(rs.zmi_vol_diff_string).trim()
    var status = [
      config.asset.grey,
      config.currency.grey,
      'graph',
      rs.arrow + z(9, n(rs.last_tick.close).format('$0.00'), ' ')[rs.uptick ? 'green' : 'red'],
      rs.zmi_vol_diff_string,
      is_sim ? rs.last_tick.timestamp.grey : false,
      z(7, n(rs.asset).format('0.000'), ' ').white,
      z(9, n(rs.currency).format('$0.00'), ' ').yellow,
      z(9, n(rs.net_worth).format('$0.00'), ' ').cyan,
      diff,
      z(7, n(rs.trade_vol).format('0.000'), ' ').white
    ].filter(function (col) { return col === false ? false : true }).join(' ')
    get('logger').info('status', status, {data: {rs: rs, zmi: zmi, new_max_vol: rs.zmi_new_max_vol, side: rs.side, price: rs.last_tick.price}})
    var status_public = [
      config.asset.grey,
      config.currency.grey,
      'graph',
      rs.arrow + z(8, n(rs.last_tick.close).format('$0.00'), ' ')[rs.uptick ? 'green' : 'red'],
      rs.zmi_vol_diff_string
    ].join(' ')
    get('logger').info('status', status_public, {public: true, data: {zmi: zmi, new_max_vol: rs.zmi_new_max_vol, side: rs.side, price: rs.last_tick.price}})
    cb()

function onOrder (err, resp, order) {
        if (err) return get('console').error('order err', err, resp, order)
        if (resp.statusCode !== 200) {
          console.error(order)
          return get('console').error('non-200 status from exchange: ' + resp.statusCode, {data: {statusCode: resp.statusCode, body: order}})
        }
        get('console').log(('[exchange] order-id: ' + order.id).cyan, {data: {order: order}})
        function getStatus () {
          client.getOrder(order.id, function (err, resp, order) {
            if (err) return get('console').error('getOrder err', err)
            if (resp.statusCode !== 200) {
              console.error(order)
              return get('console').error('non-200 status from exchange getOrder: ' + resp.statusCode, {data: {statusCode: resp.statusCode, body: order}})
            }
            if (order.status === 'done') {
              return get('console').info(('[exchange] order ' + order.id + ' done: ' + order.done_reason).cyan, {data: {order: order}})
            }
            else {
              get('console').info(('[exchange] order ' + order.id + ' ' + order.status).cyan, {data: {order: order}})
              setTimeout(getStatus, 5000)
            }
          })
        }
        getStatus()
      }
      

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




var price = n(tick.close)
          .subtract(n(tick.close).multiply(constants.markup))
          .value()
        var sell = n(rs.asset)
          .multiply(bot.trade_amt)
          .value()
        var fee = n(sell)
          .multiply(price)
          .multiply(constants.fee)
          .value()
        get('console').info(('[bot] volume trigger ' + rs.side + ' ' + n(trigger_vol).format('0.0') + ' >= ' + n(bot.min_vol).format('0.0')).yellow, {data: {action: rs.side, trigger_vol: trigger_vol, min_vol: bot.min_vol}})
        if (bot.tweet) {
          setImmediate(function () {
            var tweet = {
              status: 'zenbot recommends:\n\naction: SELL\nprice: ' + n(price).format('$0,0.00') + '\ntime: ' + get_time() + '\n\n' + constants.hashtags
            }
            twitter_client.post('statuses/update', tweet, onTweet)
          })
        }
        if (sell < constants.min_trade_possible) {
          // would buy, but not enough funds
          get('console').info(('[bot] not enough asset to sell!').red, {data: {size: sell, price: price, min_trade: constants.min_trade_possible}})
          //rs.vol = 0
          return finish()
        }
        // rs.vol = 0
        // rs.max_vol = 0
        rs.sell_price = price
        rs.asset = n(rs.asset)
          .subtract(sell)
          .value()
        rs.trade_vol = n(rs.trade_vol)
          .add(sell)
          .value()
        rs.num_trades++
        rs.currency = n(rs.currency)
          .add(n(sell).multiply(price))
          .subtract(fee)
          .value()
        get('console').info(('[bot] SELL ' + n(sell).format('0.000') + ' ' + constants.asset + ' at ' + n(price).format('$0,0.00')).yellow, {data: {size: sell, price: price}})
        assert(rs.currency >= 0)
        assert(rs.asset >= 0)
        if (bot.trade && !bot.sim) {
          var sell_params = {
            type: 'market',
            size: n(sell).format('0.000'),
            product_id: constants.product_id
          }
          client.sell(sell_params, function (err, resp, order) {
            onOrder(err, resp, order)
            syncBalance()
          })
        }
      }

