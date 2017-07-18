var tb = require('timebucket')
  , minimist = require('minimist')
  , n = require('numbro')
  , fs = require('fs')
  , path = require('path')
  , spawn = require('child_process').spawn
  , moment = require('moment')
  , colors = require('colors')
  , analytics = require('forex.analytics')
  , ProgressBar = require('progress')

var defaultIndicators = [
  'CCI',
  'MACD',
  'RSI',
  'SAR',
  'Stochastic'
]

module.exports = function container (get, set, clear) {
  var c = get('conf')
  
  return function (program) {
    program
      .command('train [selector]')
      .allowUnknownOption()
      .description('Train the binary buy/sell decision tree for the forex.analytics strategy')
      .option('--conf <path>', 'path to optional conf overrides file')
      .option('--period <value>', 'period length of a candlestick (default: 20m)', String, '20m')
      .option('--start_training <timestamp>', 'start training at timestamp')
      .option('--end_training <timestamp>', 'end training at timestamp')
      .option('--days_training <days>', 'set duration of training dataset by day count', Number, c.days)
      .option('--days_test <days>', 'set duration of test dataset to use with simulation, appended AFTER the training dataset (default: 0)', Number)
      .option('--populationCount <value>', 'population count (default: 3000)', Number)
      .option('--generationCount <value>', 'generation count (default: 250)', Number)
      .option('--selectionAmount <value>', 'selection amount (default: 30)', Number)
      .option('--leafValueMutationProbability <value>', 'leaf value mutation probability (default: 0.3)', Number)
      .option('--leafSignMutationProbability <value>', 'leaf sign mutation probability (default: 0.1)', Number)
      .option('--logicalNodeMutationProbability <value>', 'logical node mutation probability (default: 0.05)', Number)
      .option('--leafIndicatorMutationProbability <value>', 'leaf indicator mutation probability (default: 0.2)', Number)
      .option('--crossoverProbability <value>', 'crossover probability (default: 0.03)', Number)
      .option('--indicators <value>', 'comma separated list of TA-lib indicators (default: ' + defaultIndicators.toString() + ')', String)

      .action(function (selector, cmd) {        
        var s = {options: minimist(process.argv)}
        var so = s.options
        delete so._
        Object.keys(c).forEach(function (k) {
          if (typeof cmd[k] !== 'undefined') {
            so[k] = cmd[k]
          }
        })
        
        if (!so.days_test) { so.days_test = 0 }
        so.strategy = 'noop'

        if (so.start_training) {
          so.start_training = moment(so.start_training).valueOf()
          if (so.days_training && !so.end_training) {
            so.end_training = tb(so.start_training).resize('1d').add(so.days_training).toMilliseconds()
          }
        }
        if (so.end_training) {
          so.end_training = moment(so.end_training).valueOf()
          if (so.days_training && !so.start_training) {
            so.start_training = tb(so.end_training).resize('1d').subtract(so.days_training).toMilliseconds()
          }
        }
        if (!so.start_training && so.days_training) {
          var d = tb('1d')
          so.start_training = d.subtract(so.days_test).subtract(so.days_training).toMilliseconds()
        }
        if (so.days_test > 0) {
          var d = tb('1d')
          so.end_training = d.subtract(so.days_test).toMilliseconds()
        }
        so.selector = get('lib.normalize-selector')(selector || c.selector)
        so.mode = 'train'
        if (cmd.conf) {
          var overrides = require(path.resolve(process.cwd(), cmd.conf))
          Object.keys(overrides).forEach(function (k) {
            so[k] = overrides[k]
          })
        }
        var engine = get('lib.engine')(s)

        if (!so.min_periods) so.min_periods = 1
        var cursor, reversing, reverse_point
        var query_start = so.start_training ? tb(so.start_training).resize(so.period).subtract(so.min_periods + 2).toMilliseconds() : null

        function getTrainOptions () {
          return {
            populationCount: so.populationCount || 3000,
            generationCount: so.generationCount || 250,
            selectionAmount: so.selectionAmount || 30,
            leafValueMutationProbability: so.leafValueMutationProbability || 0.3,
            leafSignMutationProbability: so.leafSignMutationProbability || 0.1,
            logicalNodeMutationProbability: so.logicalNodeMutationProbability || 0.05,
            leafIndicatorMutationProbability: so.leafIndicatorMutationProbability || 0.2,
            crossoverProbability: so.crossoverProbability || 0.03,
            indicators: so.indicators ? so.indicators.split(',') : defaultIndicators
          }
        }
        
        function writeModel (strategy) {
          modelfile = 'models/forex.model_' + so.selector + '_period-' + so.period + '_from-' + moment(so.start_training).format('YYYYMMDD_HHmmssZZ') + '_to-' + moment(so.end_training).format('YYYYMMDD_HHmmssZZ') + '.json'
          modelfile.replace(/:/g, '').replace(/-/g, '')
  
          fs.writeFileSync(
            modelfile,
            JSON.stringify(
              {
                "selector": so.selector,
                "start_training": moment(so.start_training),
                "end_training": moment(so.end_training),
                "period": so.period,
                "options": getTrainOptions(),
                "strategy": strategy
              }, null, 4)
          )
  
          return modelfile
        }
        
        function trainingDone (strategy) {
          var modelfile = writeModel(strategy)
          console.log("\nModel written to " + modelfile)

          console.log(
              "\nRunning simulation on training data from "
            + moment(so.start_training).format('YYYY-MM-DD HH:mm:ss ZZ') + ' to '
            + moment(so.end_training).format('YYYY-MM-DD HH:mm:ss ZZ') + ".\n"
          )
          
          if (typeof(so.end_training) === 'undefined') {
            so.end_training = moment().format("x")
          }

          var trainingSimulation = spawn(path.resolve(__dirname, '..', 'zenbot.sh'), [
            'sim',
            so.selector,
            '--strategy', 'forex_analytics',
            '--disable_options',
            '--modelfile', path.resolve(__dirname, '..', modelfile),
            '--start', so.start_training,
            '--end', so.end_training,
            '--period', so.period,
            '--filename', 'none'
          ], { stdio: 'inherit' })

          trainingSimulation.on('exit', function (code, signal) {
            if (code) {
              console.log('Child process exited with code ' + code + ' and signal ' + signal)
              process.exit(code)
            }
            console.log()

            if (so.days_test > 0) {
              console.log(
                  "Running simulation on test data from "
                + moment(so.end_training).format('YYYY-MM-DD HH:mm:ss ZZ') + " onwards.\n"
              )
              
              var testSimulation = spawn(path.resolve(__dirname, '..', 'zenbot.sh'), [
                'sim',
                so.selector,
                '--strategy', 'forex_analytics',
                '--disable_options',
                '--modelfile', path.resolve(__dirname, '..', modelfile),
                '--start', so.end_training,
                '--period', so.period,
                '--filename', 'none'
              ], { stdio: 'inherit' })

              testSimulation.on('exit', function (code, signal) {
                if (code) {
                  console.log('Child process exited with code ' + code + ' and signal ' + signal)
                }
                console.log()
                process.exit(0)
              })
            } else {
              process.exit(0)
            }
          })
        }

        function createStrategy (candlesticks) {
          var bar = new ProgressBar(
            'Training [:bar] :percent :etas - Fitness: :fitness',
            {
              width: 80,
              total: getTrainOptions().generationCount,
              incomplete: ' '
            }
          )

          return analytics.findStrategy(candlesticks, getTrainOptions(), function(strategy, fitness, generation) {
            bar.tick({
              'fitness': fitness
            })
          })
        }

        function createCandlesticks () {
          console.log()
          
          if (!s.period) {
            console.error('no trades found! try running `zenbot backfill ' + so.selector + '` first')
            process.exit(1)
          }
         
          var option_keys = Object.keys(so)
          var output_lines = []
          option_keys.sort(function (a, b) {
            if (a < b) return -1
            return 1
          })
          var options = {}
          option_keys.forEach(function (k) {
            options[k] = so[k]
          })

          var candlesticks = []
          s.lookback.unshift(s.period)
          s.lookback.slice(0, s.lookback.length - so.min_periods).map(function (period) {
            var candlestick = {
              open: period.open,
              high: period.high,
              low: period.low,
              close: period.close,
              time: period.time / 1000
            }
            candlesticks.unshift(candlestick)
          })
          
          createStrategy(candlesticks)
            .then(function(strategy) {
              trainingDone(strategy)
            })
            .catch(function(err) {
              console.log(('Training error. Aborting.').red)
              console.log(err)
              process.exit(1)
            })
        }

        function getTrades () {
          var opts = {
            query: {
              selector: so.selector
            },
            sort: {time: 1},
            limit: 1000
          }
          if (so.end_training) {
            opts.query.time = {$lte: so.end_training}
          }
          if (cursor) {
            if (reversing) {
              opts.query.time = {}
              opts.query.time['$lt'] = cursor
              if (query_start) {
                opts.query.time['$gte'] = query_start
              }
              opts.sort = {time: -1}
            }
            else {
              if (!opts.query.time) opts.query.time = {}
              opts.query.time['$gt'] = cursor
            }
          }
          else if (query_start) {
            if (!opts.query.time) opts.query.time = {}
            opts.query.time['$gte'] = query_start
          }
          get('db.trades').select(opts, function (err, trades) {
            if (err) throw err
            if (!trades.length) {
              if (so.symmetrical && !reversing) {
                reversing = true
                reverse_point = cursor
                return getTrades()
              }
              return createCandlesticks()
            }
            if (so.symmetrical && reversing) {
              trades.forEach(function (trade) {
                trade.orig_time = trade.time
                trade.time = reverse_point + (reverse_point - trade.time)
              })
            }
            engine.update(trades, function (err) {
              if (err) throw err
              cursor = trades[trades.length - 1].time
              setImmediate(getTrades)
            })
          })
        }

        console.log('Generating training candlesticks from database...')
        getTrades()
      })
  }
}
