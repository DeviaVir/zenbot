var spawn = require('child_process').spawn
  , path = require('path')
  , MultiProgress = require('multi-progress')
  , moment = require('moment')
  , n = require('numbro')
  , fs = require('fs')
  , assert = require('assert')
  , tb = require('timebucket')
  , request = require('micro-request')

module.exports = function container (get, set, clear) {
  return function learn (options) {
    
  }
  var bot = get('bot')
  var learner = bot.learner
  assert(learner, '--learner arg required')
  var min_time = bot.start || tb('7d').subtract(12).toMilliseconds()
  var max_time = bot.end || tb(min_time).resize('7d').add(12).toMilliseconds()
  var defaults = require('../conf/defaults.json'), last_result
  process.once('SIGINT', function () {
    if (last_result) console.log(JSON.stringify(last_result, null, 2))
    else console.log('null')
  })
  function cpy (obj) {
    return JSON.parse(JSON.stringify(obj))
  }
  get('db.mems').load('learned', function (err, rs) {
    if (err) throw err
    if (!rs) {
      rs = {
        id: 'learned',
        fitness_diff: 0,
        start_fitness: 0,
        best_fitness: 1,
        roi: 0,
        trade_vol: 0,
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
    function share () {
      if (bot.share) {
        request.put(bot.share, {data: rs, headers: {'User-Agent': ZENBOT_USER_AGENT}}, function (err, resp, body) {
          if (err) throw err
          if (resp.statusCode !== 200) {
            console.error(body)
            get('console').error('non-200 from server: ' + resp.statusCode)
            process.stderr.write('\n\n\n\n')
            return
          }
          if (body.rejected && body.learned && body.learned.best_fitness > rs.best_fitness) {
            rs = body.learned
            get('console').info(('[server] learned ' + JSON.stringify(body.learned, null, 2)).yellow)
            process.stderr.write('\n\n\n\n')
          }
          else if (body.saved) {
            get('console').info(('[server] accepted ' + JSON.stringify(body.saved, null, 2)).cyan)
            process.stderr.write('\n\n\n\n')

          }
          else {
            console.error(body)
            get('console').error('bad resp from server')
            process.stderr.write('\n\n\n\n')
            return
          }
        })
      }
    }
    var simulations = 0
    var last_sim_chunks = 0
    var sims_started = false
    var first_ended = false
    var multi = new MultiProgress(process.stderr)
    get('console').info('running first simulation...')
    process.stderr.write('\n\n\n\n')
    ;(function doNext () {
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
          if (isInternal) param2 = param
          try {
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
              case 'trade_amt':
                assert(params[param] <= 1)
                assert(params[param] > 0)
                break;
              case 'vol_decay':
                assert(params[param] <= 1)
                assert(params[param] > 0)
                break;
              case 'min_vol':
                assert(params[param] > 0)
                break;
            }
          }
          catch (e) {
            console.error(e.stack.split('\n')[1])
            /*
            console.error('idx', idx)
            console.error('key', keys[idx])
            console.error('keys', keys)
            console.error('params', params)
            */
            process.stderr.write('\n\n\n\n')
            get('console').error('bad param', param + ' = ' + n(rs.best_params[param]).format('0.000') + ' -> ' + n(params[param]).format('0.000'))
            process.stderr.write('\n\n\n\n')
            if (bar) bar.terminate()
            if (is_first) sims_started = false
            return 0
          }
          return change
        }
        change = doMutate(param)
        if (!change) return doNext()
        if (param === 'min_vol') {
          change = doMutate('vol_decay', true)
        }
        if (param === 'vol_decay') {
          change = doMutate('min_vol', true)
        }
        if (!change) return doNext()
      }
      var args = Object.keys(defaults).map(function (k) {
        return '--' + k + '=' + params[k]
      })
      if (bot.throttle) args.push('--throttle', bot.throttle)
      args.unshift('sim', '--start', min_time)
      var proc = spawn(path.resolve(__dirname, '..', 'bin', 'zenbot'), args)
      var chunks = []
      proc.stdout.on('data', function (chunk) {
        chunks.push(chunk)
      })
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
          })
        }
        sim_chunks++
      })
      //proc.stderr.pipe(process.stderr)
      proc.on('exit', function (code) {
        if (code) {
          get('console').error('non-0 code: ' + code)
          process.stderr.write('\n\n\n\n')
          if (bar) bar.terminate()
          if (is_first) sims_started = false
          return doNext()
        }
        else {
          var stdout = Buffer.concat(chunks).toString('utf8')
        }
        if (bar) bar.terminate()
        var result = JSON.parse(stdout)
        if (simulations && result.trade_vol < constants.min_strat_vol) {
          get('console').error('not enough trade_vol', n(result.trade_vol).format('0.000'), '<', n(constants.min_strat_vol).format('0.000'))
          process.stderr.write('\n\n\n\n')
          if (bar) bar.terminate()
          if (is_first) sims_started = false
          return doNext()
        }
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
          rs.trade_vol = result.trade_vol
          rs.num_trades = result.num_trades
          rs.time = new Date().getTime()
          var old_best = rs.best_fitness
          rs.best_fitness = result.fitness
          rs.iterations++
          process.stderr.write('\n\n\n\n')
          get('console').info(('[ding!] ' + param + ' = ' + n(rs.best_params[param]).format('0.000') + ' -> ' + n(params[param]).format('0.000') + ', fitness ' + n(old_best).format('0.000') + ' -> ' + n(result.fitness).format('0.000') + ', num_trades = ' + result.num_trades + ', vol = ' + n(result.trade_vol).format('0.000')).cyan)
          process.stderr.write('\n\n\n\n')
          rs.best_params = params
          rs.best_param = param
          rs.best_param_direction = rs.direction
          fs.writeFileSync(path.resolve(__dirname, '..', 'conf', 'defaults.json'), JSON.stringify(rs.best_params, null, 2))
          share()
        }
        else if (param) {
          process.stderr.write('\n\n\n\n')
          var mutated = rs.best_params[param] !== params[param] && result.fitness === rs.best_fitness
          if (mutated) {
            rs.mutations++
            get('console').info(('[mutated] ' + param + ' = ' + n(rs.best_params[param]).format('0.000') + ' -> ' + n(params[param]).format('0.000') + ', fitness ' + n(result.fitness).format('0.000') + ', num_trades = ' + result.num_trades + ', vol = ' + n(result.trade_vol).format('0.000')).white)
          }
          else {
            get('console').info(('[died] ' + param + ' = ' + n(rs.best_params[param]).format('0.000') + ' -> ' + n(params[param]).format('0.000') + ', fitness ' + n(result.fitness).format('0.000') + ', num_trades = ' + result.num_trades + ', vol = ' + n(result.trade_vol).format('0.000')).grey)
          }
          process.stderr.write('\n\n\n\n')
          if (mutated) {
            rs.best_params[param] = params[param]
            fs.writeFileSync(path.resolve(__dirname, '..', 'conf', 'defaults.json'), JSON.stringify(rs.best_params, null, 2))
          }
        }
        else {
          share()
        }
        var sec_diff = n(new Date().getTime())
          .subtract(started_learning)
          .divide(1000)
          .value()
        var speed = n(1).divide(n(sec_diff).divide(60)).format('0.000') + '/min'
        get('db.mems').load('learned', function (err, learned) {
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
          get('db.mems').save(rs, function (err, saved) {
            if (err) throw err
            if (bot.duration && sec_diff >= bot.duration) {
              console.log(JSON.stringify(rs, null, 2))
              process.stderr.write('\n\n\n\n')
              setTimeout(process.exit, 1000)
              return
            }
            if (is_first) {
              for (var i = 1; i < bot.concurrency; i++) doNext()
            }
            doNext()
          })
        })
      })
    })()
  })
  return null
}