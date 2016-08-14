if (program.tweet && tick.side_vol >= c.big_trade) {
                var tweet = {
                  status: [
                    'big ' + tick.side + ':',
                    'size: ' + n(tick.side_vol).format('0.000') + ' ' + config.asset,
                    'price: ' + tick.price,
                    'time: ' + get_time(tick.time),
                    c.base_url + '/#t__' + (new Date().getTime() + 30000) + ' ' + config.hashtags
                  ].join('\n')
                }
                twitter.post('statuses/update', tweet, on_tweet)
              }