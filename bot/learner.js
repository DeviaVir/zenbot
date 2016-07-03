var spawn = require('child_process').spawn
  , path = require('path')
  , MultiProgress = require('multi-progress')
  , moment = require('moment')
  , n = require('numeral')
  , constants = require('../conf/constants.json')
  , fs = require('fs')
  , assert = require('assert')

module.exports = function container (get, set, clear) {
  var bot = get('bot')
  var start = bot.start || new Date().getTime() - (86400000 * 30 * 3) // 3 months!
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
        best_fitness: 0,
        roi: 1,
        trade_vol: 0,
        best_params: cp(defaults),
        iterations: 0,
        simulations: 0,
        total_duration: 0,
        last_duration: '',
        last_speed: null,
        direction: null,
        best_param: null,
        best_param_direction: null,
        num_trades: 0
      }
    }
    var simulations = 0
    var last_sim_chunks = 0
    var sims_started = false
    var first_ended = false
    var multi = new MultiProgress(process.stderr)
    get('console').info('running first simulation...')
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
      var params = cpy(rs.best_params), param, idx, keys
      if (simulations) {
        var is_followup = false
        if (rs.best_param && Math.random() >= 0.5) {
          is_followup = true
          param = rs.best_param
        }
        else {
          keys = Object.keys(params)
          idx = Math.ceil(Math.random() * keys.length) - 1
          param = keys[idx]
        }
        try {
          var mutate = n(Math.random())
          if (is_followup) {
            if (rs.direction === 'pos') {
              // add
              mutate = mutate.add(constants.learn_mutation)
            }
            else {
              // subtract
              mutate = mutate.subtract(n(constants.learn_mutation).multiply(2))
            }
          }
          else {
            // neutral
            mutate = mutate.subtract(constants.learn_mutation)
          }
          mutate = mutate.multiply(params[param])
            .value()
          rs.direction = mutate >= 0 ? 'pos' : 'neg'
          params[param] = n(params[param])
            .add(mutate)
            .value()
          if (param === 'vol_reset') {
            assert(params[param] > 0)
          }
          if (param === 'min_trade') {
            assert(params[param] >= constants.min_trade_possible)
          }
          if (param === 'trade_amt') {
            assert(params[param] > 0)
          }
          if (param === 'cooldown') {
            params[param] = n(params[param])
              .add(Math.round((Math.random() - 0.5) * 10))
              .value()
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
          get('console').error('bad param', param + ' = ' + n(rs.best_params[param]).format('0.000') + ' -> ' + n(params[param]).format('0.000'))
          if (bar) bar.terminate()
          if (is_first) sims_started = false
          return doNext()
        }
      }
      var args = Object.keys(defaults).map(function (k) {
        return '--' + k + '=' + params[k]
      })
      args.unshift('sim', '--start', start)
      var proc = spawn(path.resolve(__dirname, '..', 'bin', 'zenbot'), args)
      var chunks = []
      proc.stdout.on('data', function (chunk) {
        chunks.push(chunk)
      })
      proc.stderr.on('data', function (chunk) {
        if (bar && simulations) {
          bar.fmt = '  simulating [:bar] :percent :etas ' + param + ' = ' + n(rs.best_params[param]).format('0.000') + ' -> ' + n(params[param]).format('0.000') + ', fitness = ' + n(rs.best_fitness).format('+0.000') + ', roi = ' + n(rs.roi).format('+0.000')
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
      proc.on('exit', function (code) {
        if (code) throw new Error('non-0 code: ' + code)
        var stdout = Buffer.concat(chunks).toString('utf8')
        if (bar) bar.terminate()
        var result = JSON.parse(stdout)
        if (simulations && result.trade_vol < constants.min_strat_vol) {
          get('console').error('not enough trade_vol', n(result.trade_vol).format('0.000'), '<', n(constants.min_strat_vol).format('0.000'))
        }
        result.fitness = n(result.roi)
          .multiply(
            n(Math.min(result.trade_vol, constants.min_strat_vol))
              .divide(constants.min_strat_vol)
          )
          .multiply(
            n(Math.min(result.num_trades, constants.min_strat_trades))
              .divide(constants.min_strat_trades)
          )
          .value()
        if (is_first) {
          start_fitness = result.fitness
          first_ended = true
        }
        simulations++
        rs.simulations++
        last_sim_chunks = sim_chunks
        if (result.fitness > best_fitness) {
          var old_best = rs.best_fitness
          rs.best_fitness = result.fitness
          rs.roi = result.roi
          rs.trade_vol = result.trade_vol
          rs.num_trades = result.num_trades
          rs.iterations++
          process.stderr.write('\n\n')
          process.stderr.clearLine()
          get('console').info(('[ding!] ' + param + ' = ' + n(rs.best_params[param]).format('0.000') + ' -> ' + n(params[param]).format('0.000') + ', fitness ' + n(old_best).format('0.000') + ' -> ' + n(rs.best_fitness).format('0.000') + ', num_trades = ' + rs.num_trades + ', roi = ' + n(rs.roi).format('+0.000') + ', vol = ' + n(rs.trade_vol).format('0.000')).cyan)
          process.stderr.write('\n\n')
          process.stderr.clearLine()
          rs.best_params = params
          rs.best_param = param
          rs.best_param_direction = direction
          fs.writeFileSync(path.resolve(__dirname, '..', 'conf', 'defaults.json'), JSON.stringify(rs.best_params, null, 2))
        }
        else {
          process.stderr.write('\n\n')
          process.stderr.clearLine()
          var mutated = best_params[param] !== params[param] && result.fitness === rs.best_fitness
          if (mutated) {
            get('console').info(('[mutated] ' + param + ' = ' + n(best_params[param]).format('0.000') + ' -> ' + n(params[param]).format('0.000') + ', fitness ' + n(rs.best_fitness).format('0.000') + ', num_trades = ' + rs.num_trades + ', roi = ' + n(rs.roi).format('+0.000') + ', vol = ' + n(rs.trade_vol).format('0.000')).white)
          }
          else {
            get('console').info(('[died] ' + param + ' = ' + n(best_params[param]).format('0.000') + ' -> ' + n(params[param]).format('0.000') + ', fitness ' + n(rs.best_fitness).format('0.000') + ', num_trades = ' + rs.num_trades + ', roi = ' + n(rs.roi).format('+0.000') + ', vol = ' + n(rs.trade_vol).format('0.000')).grey)
          }
          process.stderr.write('\n\n')
          process.stderr.clearLine()
          if (mutated) {
            rs.best_params[param] = params[param]
            fs.writeFileSync(path.resolve(__dirname, '..', 'conf', 'defaults.json'), JSON.stringify(rs.best_params, null, 2))
          }
        }
        var sec_diff = n(new Date().getTime())
          .subtract(started_learning)
          .divide(1000)
          .value()
        var speed = n(1).divide(n(sec_diff).divide(60)).format('0.000') + '/min'
        get('db.mems').load('learned', function (err, learned) {
          if (err) throw err
          rs.fitness_diff = rs.best_fitness - rs.start_fitness
          rs.total_duration = rs.total_duration + sec_diff
          a = moment()
          b = moment().add(sec_diff, 'seconds')
          rs.last_duration = n(b.diff(a, 'hours')).format('0') + ' hrs. ' + n(b.diff(a, 'minutes')).format('0') + ' mins.'
          rs.last_speed = speed
          b = moment().add(rs.total_duration, 'seconds')
          rs.total_duration_str = n(b.diff(a, 'hours')).format('0') + ' hrs. ' + n(b.diff(a, 'minutes')).format('0') + ' mins.'
          last_result = cpy(rs)
          get('db.mems').save(rs, function (err, saved) {
            if (err) throw err
            if (bot.duration && sec_diff >= bot.duration) {
              console.log(JSON.stringify(rs, null, 2))
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