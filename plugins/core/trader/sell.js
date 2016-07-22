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
      