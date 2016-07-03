var spawn = require('child_process').spawn
  , path = require('path')
  , MultiProgress = require('multi-progress')
  , moment = require('moment')
  , n = require('numeral')
  , constants = require('../conf/constants.json')

module.exports = function container (get, set, clear) {
  var bot = get('bot')
  var started_learning = new Date().getTime()
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
    var start_roi = learned ? learned.start_roi : 1
    var best_roi = learned ? learned.best_roi : 1
    var iterations = 0
    var simulations = 0
    var last_sim_chunks = 0
    var multi = new MultiProgress(process.stderr)
    get('console').info('running first simulation...')
    for (var i = 0; i < bot.concurrency; i++) {
      (function doNext () {
        var bar, sim_chunks = 0
        if (last_sim_chunks) {
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
        try {
          params[keys[idx]] = n(Math.random())
            .subtract(constants.learn_mutation)
            .multiply(params[keys[idx]])
            .value()
        }
        catch (e) {
          console.error('idx', idx)
          console.error('key', keys[idx])
          console.error('keys', keys)
          console.error('params', params)
          throw e
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
            bar.fmt = '  simulating [:bar] :percent :etas roi = ' + n(best_roi).format('+0.000')
            bar.tick()
          }
          else {
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
          if (!simulations) {
            start_roi = result.roi
          }
          simulations++
          last_sim_chunks = sim_chunks
          if (result.roi > best_roi) {
            best_roi = result.roi
            best_params = params
            iterations++
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
                roi_diff: best_roi - learned.start_roi,
                start_roi: learned.start_roi,
                best_roi: best_roi || start_roi,
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
                roi_diff: best_roi - start_roi,
                start_roi: start_roi,
                best_roi: best_roi,
                best_params: best_params,
                iterations: iterations,
                simulations: simulations,
                total_duration: sec_diff,
                last_duration: moment(started_learning).toNow(true),
                last_speed: speed
              }
            }
            last_result = result
            get('db.mems').save(result, function (err, saved) {
              if (err) throw err
              if (bot.duration && sec_diff >= bot.duration) {
                console.log(JSON.stringify(result, null, 2))
                setTimeout(process.exit, 1000)
                return
              }
              doNext()
            })
          })
        })
      })()
    }
  })
  return null
}