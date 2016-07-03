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
  var start = bot.start || new Date().getTime() - (86400000 * 30 * 9) // 9 months!
  var defaults = require('../conf/defaults.json'), last_result
  process.once('SIGINT', function () {
    if (last_result) console.log(JSON.stringify(last_result, null, 2))
    else console.log('null')
  })
  function cpy (obj) {
    return JSON.parse(JSON.stringify(obj))
  }
  get('db.mems').load('learned', function (err, learned) {
    if (err) throw err
    var best_params = learned ? learned.best_params : cpy(defaults)
    var start_fitness = learned ? learned.start_fitness : 1
    var best_fitness = learned ? learned.best_fitness : 1
    var roi = learned ? learned.roi : 1
    var trade_vol = learned ? learned.trade_vol : 0
    var iterations = 0
    var simulations = 0
    var sim_chunks = 0
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
      var params = cpy(best_params)
      var keys = Object.keys(params)
      var idx = Math.ceil(Math.random() * keys.length) - 1
      var param = keys[idx]
      if (simulations) {
        try {
          params[param] = n(Math.random())
            .subtract(constants.learn_mutation)
            .multiply(params[keys[idx]])
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
          /*
          console.error('idx', idx)
          console.error('key', keys[idx])
          console.error('keys', keys)
          console.error('params', params)
          */
          get('console').error('bad param', param + ' = ' + n(best_params[param]).format('0.000') + ' -> ' + n(params[param]).format('0.000'))
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
        if (bar) {
          bar.fmt = '  simulating [:bar] :percent :etas ' + param + ' = ' + n(best_params[param]).format('0.000') + ' -> ' + n(params[param]).format('0.000') + ', fitness = ' + n(best_fitness).format('+0.000') + ', roi = ' + n(roi).format('+0.000')
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
        result.fitness = n(result.roi).add(
          n(Math.min(result.trade_vol, constants.min_strat_vol))
            .divide(constants.min_strat_vol)
        ).value()
        if (is_first) {
          start_fitness = result.fitness
          first_ended = true
        }
        simulations++
        last_sim_chunks = sim_chunks
        if (result.fitness > best_fitness) {
          var old_best = best_fitness
          best_fitness = result.fitness
          roi = result.roi
          trade_vol = result.trade_vol
          iterations++
          process.stderr.write('\n\n')
          process.stderr.clearLine()
          get('console').info(('[ding!] ' + param + ' = ' + n(best_params[param]).format('0.000') + ' -> ' + n(params[param]).format('0.000') + ', fitness ' + n(old_best).format('0.000') + ' -> ' + n(best_fitness).format('0.000') + ', roi = ' + n(roi).format('+0.000') + ', vol = ' + n(trade_vol).format('0.000')).cyan)
          process.stderr.write('\n\n')
          process.stderr.clearLine()
          best_params = params
          fs.writeFileSync(path.resolve(__dirname, '..', 'conf', 'defaults.json'), JSON.stringify(best_params, null, 2))
        }
        else {
          process.stderr.write('\n\n')
          process.stderr.clearLine()
          if (best_params[param] !== params[param]) {
            get('console').info(('[mutated] ' + param + ' = ' + n(best_params[param]).format('0.000') + ' -> ' + n(params[param]).format('0.000') + ', fitness ' + n(best_fitness).format('0.000') + ', roi = ' + n(roi).format('+0.000') + ', vol = ' + n(trade_vol).format('0.000')).white)
          }
          else {
            get('console').info(('[died] ' + param + ' = ' + n(best_params[param]).format('0.000') + ' -> ' + n(params[param]).format('0.000') + ', fitness ' + n(best_fitness).format('0.000') + ', roi = ' + n(roi).format('+0.000') + ', vol = ' + n(trade_vol).format('0.000')).grey)
          }
          process.stderr.write('\n\n')
          process.stderr.clearLine()
          if (best_params[param] !== params[param]) {
            best_params[param] = params[param]
            fs.writeFileSync(path.resolve(__dirname, '..', 'conf', 'defaults.json'), JSON.stringify(best_params, null, 2))
          }
        }
        var sec_diff = n(new Date().getTime())
          .subtract(started_learning)
          .divide(1000)
          .value()
        var speed = n(simulations).divide(n(sec_diff).divide(60)).format('0.000') + '/min'
        get('db.mems').load('learned', function (err, learned) {
          if (err) throw err
          var result
          if (learned) {
            result = {
              id: 'learned',
              fitness_diff: best_fitness - learned.start_fitness,
              start_fitness: learned.start_fitness,
              best_fitness: best_fitness || start_fitness,
              roi: roi,
              trade_vol: trade_vol,
              best_params: best_params,
              iterations: learned.iterations + iterations,
              simulations: learned.simulations + simulations,
              total_duration: learned.total_duration + sec_diff,
              last_duration: moment(started_learning).toNow(true),
              last_speed: speed
            }
          }
          else {
            result = {
              id: 'learned',
              fitness_diff: best_fitness - start_fitness,
              start_fitness: start_fitness,
              best_fitness: best_fitness,
              roi: roi,
              best_params: best_params,
              iterations: iterations,
              simulations: simulations,
              total_duration: sec_diff,
              last_duration: moment(started_learning).toNow(true),
              last_speed: speed
            }
          }
          var a = moment()
          var b = moment().add(result.total_duration, 'seconds')
          result.total_duration_str = n(b.diff(a, 'hours')).format('0') + ' hrs. ' + n(b.diff(a, 'minutes')).format('0') + ' mins.'
          last_result = result
          get('db.mems').save(result, function (err, saved) {
            if (err) throw err
            if (bot.duration && sec_diff >= bot.duration) {
              console.log(JSON.stringify(result, null, 2))
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