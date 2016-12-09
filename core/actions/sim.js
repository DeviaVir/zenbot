var tb = require('timebucket')
  , sig = require('sig')
  , assert = require('assert')
  , defaults = require('../../../../conf/defaults.json'), last_result

module.exports = function container (get, set, clear) {
  var series = get('motley:vendor.run-series')
  var get_timestamp = get('utils.get_timestamp')
  var get_id = get('utils.get_id')
  var get_duration = get('utils.get_duration')

  return function sim () {
    var c = get('config')
    function simSyncLearned () {
      //if (get('command') === 'sim') {
      //}

      get('mems').load(c.default_selector, function (err, learned) {
        if (err) throw err
        //if (c.default_selector) {
        if (learned) {

          /*
          if (rs.last_learned && learned.best_fitness > rs.last_learned.best_fitness) {
            get('logger').learn('learner', ('[zen] i have improved the strategy!').yellow)
            //get('console').info(('[zen] new roi = ' + n(learned.roi).format('0.000000000') + ' (' + learned.learner + ')').yellow, {data: {learned: learned, last_learned: rs.last_learned}})
           get('logger').learn('learner', ('[zen] new roi = ' + n(learned.roi).format('0.000000000') + ' (' + learned.learner + ')').yellow)
          }
          else if (!rs.last_learned) {
            //get('console').info(('[zen] roi = ' + n(learned.roi).format('0.000000000') + ' (' + learned.learner + ')').yellow, {data: {learned: learned}})
            get('logger').learn('learner', ('[zen] roi = ' + n(learned.roi).format('0.000000000') + ' (' + learned.learner + ')').yellow)
          }
          */
          Object.keys(learned.best_params).forEach(function (k) {
            //console.log('rs[k]')
            //console.log(rs[k])
            //console.log('learned.best_params[k]')
            //console.log(learned.best_params[k])
            s[k] = learned.best_params[k]
            //get('logger').error('Not Loading Learned Params!')
            //get('logger').learn('learner', ('[old] ' + k + ' = ' + last_learned.best_params[k]).grey)
            //get('logger').learn('learner', '\n\n')
            get('logger').learn('learner', ('using learned param: ' + k + ' = ' + learned.best_params[k]).yellow)
            //get('logger').learn('learner', '\n\n')

            //console.log('New ' + k + ' = ' + s[k] + '     Default value: ' + defaults[k])
            //console.log('Using learned.best_params for: ' + k)
            /*
            if (!s.last_learned || s.last_learned.best_params[k] !== learned.best_params[k]) {
              if (s.last_learned) {
                get('logger').learn('learner', ('[old] ' + k + ' = ' + s.last_learned.best_params[k]).grey)
              }
              get('logger').learn('learner', ('[learned] ' + k + ' = ' + learned.best_params[k]).yellow)
            }
          */
        })

        if (options.rsi_query_limit) {
          s.rsi_query_limit = options.rsi_query_limit
          get('logger').learn('learner', ('new s.rsi_query_limit = ' + s.rsi_query_limit).yellow)
        }
        if (options.rsi_periods) {
          s.rsi_periods = options.rsi_periods
          get('logger').learn('learner', ('new s.rsi_periods = ' + s.rsi_periods).yellow)
        }
        if (options.rsi_period) {
          s.rsi_period = options.rsi_period
          get('logger').learn('learner', ('new s.rsi_period = ' + s.rsi_period).yellow)
        }
        if (options.rsi_up) {
          s.rsi_up = options.rsi_up
          get('logger').learn('learner', ('new s.rsi_up = ' + s.rsi_up).yellow)
        }
        if (options.rsi_down) {
          s.rsi_down = options.rsi_down
          get('logger').learn('learner', ('new s.rsi_down = ' + s.rsi_down).yellow)
        }
        if (options.check_period) {
          s.check_period = options.check_period
          get('logger').learn('learner', ('new s.check_period = ' + s.check_period).yellow)
        }
        if (options.trade_pct) {
          s.trade_pct = options.trade_pct
          get('logger').learn('learner', ('new s.trade_pct = ' + s.trade_pct).yellow)
        }
        if (options.min_trade) {
          s.min_trade = options.min_trade
          get('logger').learn('learner', ('new s.min_trade = ' + s.min_trade).yellow)
        }
        if (options.min_double_wait) {
          s.min_double_wait = options.min_double_wait
          get('logger').learn('learner', ('new s.min_double_wait = ' + s.min_double_wait).yellow)
        }
        if (options.min_reversal_wait) {
          s.min_reversal_wait = options.min_reversal_wait
          get('logger').learn('learner', ('new s.min_reversal_wait = ' + s.min_reversal_wait).yellow)
        }
        if (options.min_performance) {
          s.min_performance = options.min_performance
          get('logger').learn('learner', ('new s.min_performance = ' + s.min_performance).yellow)
        }
        if (options.stop_loss_percentage) {
          s.stop_loss_percentage = options.stop_loss_percentage
          get('logger').learn('learner', ('new s.stop_loss_percentage = ' + s.stop_loss_percentage).yellow)
        }
        if (options.stop_loss_wait_time) {
          s.stop_loss_wait_time = options.stop_loss_wait_time
          get('logger').learn('learner', ('new s.stop_loss_wait_time = ' + s.stop_loss_wait_time).yellow)
        }
        if (options.useStopLoss) {
          s.useStopLoss = options.useStopLoss
          get('logger').learn('learner', ('new s.useStopLoss = ' + s.useStopLoss).yellow)
        }
          //s.last_learned = learned
        }
        else { get('logger').error('Not Loading Learned Params! (Error or Fresh Learner on Pair)') }
      })
    }
    var c = get('config')
    var sMatch = c.default_selector.match(/^([^\.]+)\.([^-]+)-([^-]+)$/)
    assert(sMatch)
    var simExchange = sMatch[1]
    var simAsset = sMatch[2]
    var simCurrency = sMatch[3]


    get('logger').learn('learner', ('Simulating for c.default_selector = ' + c.default_selector).yellow)

    var get_run_states = get('utils.get_run_states')
    var options = get('options')

    if (!options.verbose) {
      set('@silent', true)
    }
    //if (get('args').length) {
    //  throw new Error('unknown arg')
    //}

    var runner = get('runner')
    var start = new Date().getTime()
    var s = {id: get_id()}


    s.ticks = 0
    s.tick_sigs = []
    s.start_us = tb('µs').value
    s.sim_end_bucket = tb(c.sim_input_unit)
    s.sim_end_time = s.sim_end_bucket.toMilliseconds()
    s.sim_end_tick = s.sim_end_bucket.toString()
    s.sim_end_timestamp = get_timestamp(s.sim_end_time)
    s.sim_start_bucket = tb(s.sim_end_tick).subtract(c.sim_input_limit)
    s.sim_start_time = s.sim_start_bucket.toMilliseconds()
    s.sim_start_tick = s.sim_start_bucket.toString()
    s.sim_start_timestamp = get_timestamp(s.sim_start_time)
    s.max_time = s.sim_start_time - 1
    s.rsi_query_limit = defaults.rsi_query_limit // RSI initial value lookback
    s.rsi_periods = defaults.rsi_periods // RSI smoothing factor
    s.rsi_period = defaults.rsi_period // RSI tick size
    s.rsi_up = defaults.rsi_up // upper RSI threshold
    s.rsi_down = defaults.rsi_down // lower RSI threshold
    s.check_period = defaults.check_period // speed to trigger actions at
    s.trade_pct = defaults.trade_pct // trade % of current balance
    s.min_double_wait = defaults.min_double_wait // wait in ms after action before doing same action
    s.min_reversal_wait = defaults.min_reversal_wait // wait in ms after action before doing opposite action
    s.min_performance = defaults.min_performance // abort trades with lower performance score
    s.stop_loss_percentage = defaults.stop_loss_percentage
    s.stop_loss_wait_time = defaults.stop_loss_wait_time

    get('logger').learn('learner', ('Sim Start Timestamp: ' + s.sim_start_timestamp).yellow)
    get('logger').learn('learner', ('Sim End Timestamp: ' + s.sim_end_timestamp).yellow)

    //s.rsi_periods = defaults.rsi_periods // RSI smoothing factor
    //s.rsi_period = defaults.rsi_period // RSI tick size
    if (options.learning) {
      simSyncLearned()
    }
    if (options.rsi_query_limit) {
      s.rsi_query_limit = options.rsi_query_limit
      get('logger').learn('learner', ('new s.rsi_query_limit = ' + s.rsi_query_limit).yellow)
    }
    if (options.rsi_periods) {
      s.rsi_periods = options.rsi_periods
      get('logger').learn('learner', ('new s.rsi_periods = ' + s.rsi_periods).yellow)
    }
    if (options.rsi_period) {
      s.rsi_period = options.rsi_period
      get('logger').learn('learner', ('new s.rsi_period = ' + s.rsi_period).yellow)
    }
    if (options.rsi_up) {
      s.rsi_up = options.rsi_up
      get('logger').learn('learner', ('new s.rsi_up = ' + s.rsi_up).yellow)
    }
    if (options.rsi_down) {
      s.rsi_down = options.rsi_down
      get('logger').learn('learner', ('new s.rsi_down = ' + s.rsi_down).yellow)
    }
    if (options.check_period) {
      s.check_period = options.check_period
      get('logger').learn('learner', ('new s.check_period = ' + s.check_period).yellow)
    }
    if (options.trade_pct) {
      s.trade_pct = options.trade_pct
      get('logger').learn('learner', ('new s.trade_pct = ' + s.trade_pct).yellow)
    }
    if (options.min_trade) {
      s.min_trade = options.min_trade
      get('logger').learn('learner', ('new s.min_trade = ' + s.min_trade).yellow)
    }
    if (options.min_double_wait) {
      s.min_double_wait = options.min_double_wait
      get('logger').learn('learner', ('new s.min_double_wait = ' + s.min_double_wait).yellow)
    }
    if (options.min_reversal_wait) {
      s.min_reversal_wait = options.min_reversal_wait
      get('logger').learn('learner', ('new s.min_reversal_wait = ' + s.min_reversal_wait).yellow)
    }
    if (options.min_performance) {
      s.min_performance = options.min_performance
      get('logger').learn('learner', ('new s.min_performance = ' + s.min_performance).yellow)
    }
    if (options.stop_loss_percentage) {
      s.stop_loss_percentage = options.stop_loss_percentage
      get('logger').learn('learner', ('new s.stop_loss_percentage = ' + s.stop_loss_percentage).yellow)
    }
    if (options.stop_loss_wait_time) {
      s.stop_loss_wait_time = options.stop_loss_wait_time
      get('logger').learn('learner', ('new s.stop_loss_wait_time = ' + s.stop_loss_wait_time).yellow)
    }
    if (options.useStopLoss) {
      s.useStopLoss = options.useStopLoss
      get('logger').learn('learner', ('new s.useStopLoss = ' + s.useStopLoss).yellow)
    }
    ;(function getNext () {
      var params = {
        query: {
          app: get('app_name'),
          time: {
            $lt: s.sim_end_time,
            $gt: s.max_time
          }
        },
        sort: {
          time: 1
        },
        limit: c.sim_limit
      }
/*
        console.log('\n\n\n\n\n\n\n')
        console.log('params.query.app:')
        console.log(params.query.app)
*/
      get('ticks').select(params, function (err, ticks) {
        if (err) throw err
        //console.log('\n\n\n\n\n\n\n')
        //console.log('ticks:')
        //console.log(ticks)
        if (ticks.length) {
          var tasks = ticks.map(function (tick) {
            if (!s.start_time) {
              s.start_time = tick.time
            }
            s.end_time = tick.time
            s.max_time = Math.max(tick.time, s.max_time)

            if (options.start) {
              s.start_time = options.start
            }
            if (options.end) {
              s.end_time = options.end_time
            }

            s.ticks++
            s.tick_sigs.push(sig(tick))
            return function task (done) {
              runner(tick, s, function (err) {
                if (err) return done(err)
                setImmediate(done)
              })
            }
          })
          series(tasks, function (err) {
            if (err) {
              get('logger').error('run err', err)
            }
            setImmediate(getNext)
          })
        }
        else {
          s.end_us = tb('µs').value
          assert(!Number.isNaN(s.end_us))
          assert(!Number.isNaN(s.start_us))
          s.last_us = s.end_us - s.start_us
          assert(!Number.isNaN(s.last_us))
          s.last_duration = get_duration(s.last_us)
          s.sim_time = s.end_time ? s.end_time - s.start_time : 0
          s.sim_duration = get_duration(s.sim_time * 1000)
          s.input_hash = sig(s.tick_sigs)
          delete s.tick_sigs
          delete s.start_us
          delete s.sim_end_bucket
          delete s.sim_end_time
          delete s.sim_end_tick
          delete s.start_bucket
          delete s.start_time
          delete s.start_tick
          delete s.max_time
          get('run_states').save(s, function (err, saved) {
            if (err) throw err
            set('sim_result', saved)
            console.log(JSON.stringify(saved, null, 2))
            get('app').close(function () {
              process.exit()
            })
          })
        }
      })
    })()
  }
}