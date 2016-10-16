  //console.log('STARTING LEARNER DUDE!')

var spawn = require('child_process').spawn
  , path = require('path')
  , MultiProgress = require('multi-progress')
  , moment = require('moment')
  , n = require('numbro')
  , constants = require('../../conf/constants.json')
  , fs = require('fs')
  , assert = require('assert')
  , tb = require('timebucket')
  , request = require('micro-request')


module.exports = function container (get, set, clear) {
  return function learn (options) {
          //var bot = get('bot')
      //console.log('STARTING LEARNER DUDE!')
      //console.log('Learner Work In Progress...')

      //var bot = get('zenbrain')
      var c = get('config')
      var options = get('options')
      var get_timestamp = get('utils.get_timestamp')
      var exchangePair = c.default_selector



      var bot = {}
      bot.concurrency = require('os').cpus().length
      //console.log('Running learner with ' + bot.concurrency + ' cores') 

      if (options.concurrency) {
        bot.concurrency = options.concurrency
        console.log('Running learner with ' + bot.concurrency + ' cores') 
      }
      else { console.log('Running learner with ' + bot.concurrency + ' cores') }

      //return

      //.option('-c, --concurrency <int>', 'number of concurrent simulations', Number, require('os').cpus().length)

      //var learner = get(learner)
      //var learner = get('learn')
      //var learner = get('zenbrain:actions.learn')
      var learner = require('./learner')
      //var learned = require('./learned')
      assert(learner, '--learner arg required')

      var min_time = bot.start || tb('7d').subtract(12).toMilliseconds()
      var start_timestamp = get_timestamp(min_time)
      //console.log('min_time:' + min_time)
      //console.log('min_time timestamp:' + min_time)
      var max_time = bot.end || tb(min_time).resize('7d').add(12).toMilliseconds()
      var end_timestamp = get_timestamp(max_time)
      //console.log('max_time:' + max_time)
      //console.log('max_time timestamp:' + max_time)
      get('logger').learn('learner', ('Sim Start Timestamp: ' + start_timestamp).yellow)
      get('logger').learn('learner', ('Sim End Timestamp: ' + end_timestamp).yellow)


      var sMatch = c.default_selector.match(/^([^\.]+)\.([^-]+)-([^-]+)$/)
      assert(sMatch)
      var exchange = sMatch[1]
      var asset = sMatch[2]
      var currency = sMatch[3]

      //console.log('Learner working on ' + exchange + ' pair: ' + asset  + '-' + currency + '...')
      get('logger').learn('learner', ('Learner working on = ' + c.default_selector).yellow)



      //var constants = require('../../conf/learner_defaults.json')
      var defaults = require('../../conf/' + exchange + '_' + asset  + '-' + currency + '_learner_params.json'), last_result
      console.log('../../conf/' + exchange + '_' + asset  + '-' + currency + '_learner_params.json')
      //console.log('defaults:')
      //console.log(defaults)

      process.once('SIGINT', function () {
        if (last_result) console.log(JSON.stringify(last_result, null, 2))
        else console.log('null')
      })
      function cpy (obj) {
        return JSON.parse(JSON.stringify(obj))
      }
      //require('./learned')
      //var learnerMems = get('mems')
      //console.log(learnerMems)

      //learnerMems.load('learned', function (err, rs) {
      //get('db').collection('mems').load('learned', function (err, rs) {
      //get('mems').load('learned', function (err, selector) {
      get('mems').load(c.default_selector, function (err, rs) {

        if (err) throw err

        if (!rs) {
          rs = {
            id: c.default_selector,
            fitness_diff: 0,
            start_fitness: 0,
            best_fitness: 1,
            roi: 0,
            rsi_up: 0,
            rsi_down: 0,
            min_performance: 0,
            best_params: cpy(defaults),
            iterations: 0,
            simulations: 0,
            mutations: 0,
            total_duration: 0,
            last_duration: '',
            last_speed: null,
            direction: null,
            best_param: null,
            best_param_direction: null,
            num_trades: 0,
            last_mutate: null,
            learner: learner,
            time: new Date().getTime()
          }
        }
        //if (!selector[c.default_selector]) {
        //  selector[c.default_selector] = rs
        //}

        console.log(rs)



        //console.log('rs.best_params:')
        //console.log(rs.best_params)

        /*
        function share () {
          if (bot.share) {
            request.put(bot.share, {data: rs, headers: {'User-Agent': ZENBOT_USER_AGENT}}, function (err, resp, body) {
              if (err) throw err
              if (resp.statusCode !== 200) {
                console.error(body)
                get('logger').error('non-200 from server: ' + resp.statusCode)
                process.stderr.write('\n\n\n\n')
                return
              }
              if (body.rejected && body.learned && body.learned.best_fitness > rs.best_fitness) {
                rs = body.learned
                get('logger').learn('learn', ('[server]  learned ' + c.default_selector + JSON.stringify(body.learned, null, 2)).yellow)
                process.stderr.write('\n\n\n\n')
              }
              else if (body.saved) {
                get('logger').learn('learn', ('[server] accepted '+ c.default_selector + JSON.stringify(body.saved, null, 2)).cyan)
                process.stderr.write('\n\n\n\n')

              }
              else {
                console.error(body)
                get('logger').error('bad resp from server')
                process.stderr.write('\n\n\n\n')
                return
              }
            })
          }
        }
        */
        var simulations = 0
        var last_sim_chunks = 0
        var sims_started = false
        var first_ended = false
        var multi = new MultiProgress(process.stderr)
        get('logger').learn('running first simulation...')
        process.stderr.write('\n\n\n\n')
        ;(function doNext () {
              //console.error('Does doNext Run?')

          var started_learning = new Date().getTime()
          var bar, sim_chunks = 0
          var is_first = !sims_started
          sims_started = true
          if (last_sim_chunks && first_ended) {
            bar = multi.newBar('  simulating [:bar] :percent :etas', {
              complete: '=',
              incomplete: ' ',
              width: constants.progress_bar_width,
              total: last_sim_chunks,
            })
          }
          var params = cpy(rs.best_params), param, param2, idx, keys, change
          if (simulations) {
            keys = Object.keys(params)
            idx = Math.ceil(Math.random() * keys.length) - 1
            param = keys[idx]
            function doMutate (param, isInternal) {
              //console.error('Does doMutate Run?')
              if (isInternal) param2 = param
              /*
              if (typeof param === 'string' || param instanceof String) {
                try {
                  param = parseInt(param)
                  //change = Math.random() < 0.5 ? -1 : 1
                  change = n(Math.random() < 0.5 ? -1 : 1).value()
                  rs.last_mutate = change
                  rs.direction = change >= 0 ? 'pos' : 'neg'
                  params[param] = n(params[param])
                    .add(change)
                    .value()
                  switch (param) {
                    case 'rsi_period':
                      //param = parseInt(param)
                      param = n(param.format(0))
                      assert(params[param] > 0)
                      param = (param + 'h')
                      break;
                    case 'check_period':
                      //param = parseInt(param)
                      param = n(param.format(0))
                      assert(params[param] > 0)
                      param = (param + 'm')
                      break;
                  }
                }
                catch (e) {
                  console.error(e.stack.split('\n')[1])
                  console.error('Ah Shit...')
                  
                  //console.error('idx', idx)
                  //console.error('key', keys[idx])
                  //console.error('keys', keys)
                  //console.error('params', params)
                  
                  process.stderr.write('\n\n\n\n')
                  get('logger').error('bad param', param + ' = ' + n(rs.best_params[param]).format('0.000') + ' -> ' + n(params[param]).format('0.000'))
                  process.stderr.write('\n\n\n\n')
                  if (bar) bar.terminate()
                  if (is_first) sims_started = false
                  return 0
                }
                return change
              }
              */
              else try {
                change = n(Math.random())
                  .subtract(0.5)
                  .multiply(constants.learn_mutation)
                  .multiply(params[param])
                  .value()
                rs.last_mutate = change
                rs.direction = change >= 0 ? 'pos' : 'neg'
                params[param] = n(params[param])
                  .add(change)
                  .value()
                switch (param) {
                  case 'rsi_up':
                    assert(params[param] <= 100)
                    assert(params[param] > 0)
                    break;
                  case 'rsi_down':
                    assert(params[param] <= 100)
                    assert(params[param] > 0)
                    break;
                  case 'rsi_periods':
                    param = n(param.format(0))
                    assert(params[param] > 0)
                    break;
                  case 'rsi_query_limit':
                    param = n(param.format(0))
                    assert(params[param] <= 1000)
                    assert(params[param] >= 1)
                    break;
                  case 'trade_pct':
                    param = n(param.format(0.000))
                    assert(params[param] <= 1)
                    assert(params[param] >= 0)
                    break;
                  case 'min_trade':
                    param = n(param.format(0.000))
                    assert(params[param] <= 1)
                    assert(params[param] >= 0)
                    break;
                  case 'min_double_wait':
                    assert(params[param] > 0)
                    break;
                  case 'min_reversal_wait':
                    assert(params[param] > 0)
                    break;
                  case 'min_performance':
                    assert(params[param] <= 100)
                    assert(params[param] >= -100)
                    break;
                  case 'stop_loss_percentage':
                    assert(params[param] < 1)
                    assert(params[param] > 0)
                    break;
                  case 'stop_loss_wait_time':
                    assert(params[param] > 0)
                    break;
                }
              }
              catch (e) {
                console.error(e.stack.split('\n')[1])
                console.error('Ah Shit...')
                /*
                console.error('idx', idx)
                console.error('key', keys[idx])
                console.error('keys', keys)
                console.error('params', params)
                */
                process.stderr.write('\n\n\n\n')
                get('logger').error('bad param', param + ' = ' + n(rs.best_params[param]).format('0.000') + ' -> ' + n(params[param]).format('0.000'))
                process.stderr.write('\n\n\n\n')
                if (bar) bar.terminate()
                if (is_first) sims_started = false
                return 0
              }
              return change

            }
            change = doMutate(param)
            if (!change) return doNext()
            /*
            if (param === 'min_performance') {
              change = doMutate('min_performance_decay', true)
            }
            if (param === 'min_performance_decay') {
              change = doMutate('min_performance', true)
            }
            */
            if (!change) return doNext()
          }
          var args = Object.keys(defaults).map(function (k) {
            //console.log("--' + k + '=' + params[k]")
            //console.log('k: ' + k)
            //console.log('trying: ' + k + '=>' + params[k])
            return '--' + k + '=' + params[k]
            //return '--' + k + params[k]

          })
          //if (bot.throttle) args.push('--throttle', bot.throttle)
          //args.unshift('sim', '--start', min_time)
          //args.unshift('sim')
          if (options.useconfig) {
            var configString = '--config=config_' + exchange + '_' + asset + '_' + currency + '.js'
            //get('logger').learn('learner', ('configString = ' + configString).yellow)

            args.unshift('sim', configString, '--verbose', '--learning')
            //args.unshift('sim', '--config=config_poloniex_FCT_BTC.js', '--verbose', '--learning')
            
          }
          else { args.unshift('sim', '--verbose', '--learning') }
          //args.unshift('sim', '--verbose', '--concurrency=4')
          //args.unshift('sim', '--verbose', '--concurrency=' + bot.concurrency)
          //args.unshift('sim', '--verbose', '-c ' + bot.concurrency)
          //var proc = spawn(path.resolve(__dirname, '..', 'bin', 'zenbot'), args)
          //console.log('args:')
          //console.log(args)

          var proc = spawn(path.resolve(__dirname, '../../', 'zenbot'), args)
          //var proc = spawn(process.argv[1], sub_args, {stdio: 'inherit'})

          //get('logger').learn('Is error here?')

          var chunks = []
          proc.stdout.on('data', function (chunk) {
            chunks.push(chunk)
          })
          //get('logger').error('Is error here?2')

          proc.stderr.on('data', function (chunk) {
            if (bar && simulations) {
              bar.fmt = '  simulating [:bar] :percent :etas change = ' + n(change).format('0.000') + ', ' + param + ' = ' + n(rs.best_params[param]).format('0.000') + ' -> ' + n(params[param]).format('0.000') + ', ' + param2 + ' = ' + n(rs.best_params[param2]).format('0.000') + ' -> ' + n(params[param2]).format('0.000') + ', best_roi = ' + n(rs.roi).format('+0.000')
              bar.tick()
            }
            else if (is_first) {
              chunk.toString('utf8').split('\n').forEach(function (line) {
                //process.stderr.clearLine()
                process.stderr.cursorTo(0)
                process.stderr.write(line)
                //if (line === '{') { 
                  //var writeThatShit(line)
                //}
              })
              //var buf1 = Buffer.concat(chunks)
              //var buf1_start = buf1.indexOf('{')
              //var buf2 = buf1.slice(buf1_start)
              //var resultBuffer = buf2.toString('utf8')
              //var result = JSON.parse(resultBuffer)

            }
            sim_chunks++
          })
          //get('logger').error('Is error here?3')

          //proc.stderr.pipe(process.stderr)
          proc.on('exit', function (code) {
            if (code) {
              get('logger').error('non-0 code: ' + code)
              process.stderr.write('\n\n\n\n')
              if (bar) bar.terminate()
              if (is_first) sims_started = false
              return doNext()
            }
            else {
              //var stdout = Buffer.concat(chunks).toString('utf8')
              var buf3 = Buffer.concat(chunks)
              var buf3_start = buf3.indexOf('{')
              var buf4 = buf3.slice(buf3_start)
              var resultBuffer = buf4.toString('utf8')
            }
            if (bar) bar.terminate()
            //var result = JSON.parse(stdout)
            var result = JSON.parse(resultBuffer)
            //console.log('result:')
            //console.log(result)
            //console.log('result.roi:')
            //console.log(result.roi)
          /*
            if (simulations && result.trade_vol < constants.min_strat_vol) {
              get('logger').error('not enough trade_vol', n(result.trade_vol).format('0.000'), '<', n(constants.min_strat_vol).format('0.000'))
              process.stderr.write('\n\n\n\n')
              if (bar) bar.terminate()
              if (is_first) sims_started = false
              return doNext()
            }
          */
            result.fitness = result.roi
            if (is_first) {
              start_fitness = result.fitness
              first_ended = true
            }
            simulations++
            rs.simulations++
            last_sim_chunks = sim_chunks
            rs.learner = learner
            if (param && result.fitness > rs.best_fitness) {
              rs.roi = result.roi
              //rs.trade_vol = result.trade_vol
              rs.rsi_up = result.rsi_up
              rs.rsi_down = result.rsi_down
              rs.min_performance = result.min_performance
              rs.num_trades = result.num_trades
              rs.time = new Date().getTime()
              var old_best = rs.best_fitness
              rs.best_fitness = result.fitness
              rs.iterations++
              process.stderr.write('\n\n\n\n')
              get('logger').learn('learner', ('[ding!] ' + c.default_selector + ': ' + param + ' = ' + n(rs.best_params[param]).format('0.000') + ' -> ' + n(params[param]).format('0.000') + ', fitness ' + n(old_best).format('0.000') + ' -> ' + n(result.fitness).format('0.000') + ', num_trades = ' + result.num_trades + ', ROI = ' + n(result.roi).format('0.00000000')).cyan)
              process.stderr.write('\n\n\n\n')
              rs.best_params = params
              rs.best_param = param
              rs.best_param_direction = rs.direction
              fs.writeFileSync(path.resolve(__dirname, '../../', 'conf', exchange + '_' + asset  + '-' + currency + '_learner_params.json'), JSON.stringify(rs.best_params, null, 2))
              //share()
            }
            else if (param) {
              process.stderr.write('\n\n\n\n')
              var mutated = rs.best_params[param] !== params[param] && result.fitness === rs.best_fitness
              if (mutated) {
                rs.mutations++
                get('logger').learn('learner', ('[mutated] ' + c.default_selector + ': ' + param + ' = ' + n(rs.best_params[param]).format('0.000') + ' -> ' + n(params[param]).format('0.000') + ', fitness ' + n(result.fitness).format('0.000') + ', num_trades = ' + result.num_trades + ', min_performance = ' + n(result.min_performance).format('0.0000') + ', Zombie ROI = ' + n(result.roi).format('0.00000000')).white)
              }
              else {
                get('logger').learn('learner', ('[died] ' + c.default_selector + ': ' + param + ' = ' + n(rs.best_params[param]).format('0.000') + ' -> ' + n(params[param]).format('0.000') + ', fitness ' + n(result.fitness).format('0.000') + ', num_trades = ' + result.num_trades + ', min_performance = ' + n(result.min_performance).format('0.0000') + ', R.I.P. ROI = ' + n(result.roi).format('0.00000000')).grey)
              }
              process.stderr.write('\n\n\n\n')
              if (mutated) {
                rs.best_params[param] = params[param]
                fs.writeFileSync(path.resolve(__dirname, '../../', 'conf', exchange + '_' + asset  + '-' + currency + '_learner_params.json'), JSON.stringify(rs.best_params, null, 2))
              }
            }
            else {
              //share()
            }
            var sec_diff = n(new Date().getTime())
              .subtract(started_learning)
              .divide(1000)
              .value()
            var speed = n(1).divide(n(sec_diff).divide(60)).format('0.000') + '/min'

            var exchangePair = c.default_selector


            get('mems').load('learned', function (err, learned) {
              if (err) throw err
              get('mems').load(c.default_selector, function (err, selector) {
                if (err) throw err

                if (!rs.start_fitness) {
                  rs.start_fitness = rs.best_fitness
                }
                rs.fitness_diff = rs.best_fitness - rs.start_fitness
                rs.total_duration = rs.total_duration + sec_diff
                rs.last_duration = moment().add(sec_diff, 'seconds').fromNow(true)
                rs.last_speed = speed
                rs.total_duration_str = moment().add(rs.total_duration, 'seconds').fromNow(true)
                last_result = cpy(rs)
   
                //var learnSelector = {}
                //var currentSelector = {
                var pairs = {}
                var currentSelector = {
                  id: c.default_selector,
                  params: rs
                }

                //selector[c.default_selector] = rs

                //get('mems').save(learnSelector, function (err, saved) {
                get('mems').save(rs, function (err, saved) {
                  if (err) throw err
                  if (bot.duration && sec_diff >= bot.duration) {
                    console.log(JSON.stringify(rs, null, 2))
                    process.stderr.write('\n\n\n\n')
                    setTimeout(process.exit, 1000)
                    return
                  }
                  if (is_first) {
                    if (options.reset_roi) {
                      var buf1 = Buffer.concat(chunks)
                      var buf1_start = buf1.indexOf('{')
                      var buf2 = buf1.slice(buf1_start)
                      var resultBuffer = buf2.toString('utf8')
                      var result = JSON.parse(resultBuffer)

                      //console.error('result.roi:  ' + result.roi)
                      get('logger').learn('learner', ('result.roi:  ' + result.roi).grey)
                      get('logger').learn('learner', ('\n\n'))
                      rs.roi = result.roi
                    }
                    for (var i = 1; i < bot.concurrency; i++) doNext()
                  }
                  doNext()
                })
              })
            })
          })
            //get('logger').error('Is error here?4')

        })()
      })
      return null
    }
  }
