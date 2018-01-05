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
  , crypto = require('crypto')

var fa_defaultIndicators = [
  'CCI',
  'MACD',
  'RSI',
  'SAR',
  'Stochastic'
]

var fa_availableIndicators = [
  'ATR',
  'BOP',
  'CCI',
  'MACD',
  'MACD_Signal',
  'MACD_Histogram',
  'Momentum',
  'RSI',
  'SAR',
  'SMA15_SMA50',
  'Stochastic'
]


function fa_getTrainOptions (so) {
  if (typeof(so) === "undefined") so = {}

  return {
    populationCount: so.populationCount || 100,
    generationCount: so.generationCount || 100,
    selectionAmount: so.selectionAmount || 10,
    leafValueMutationProbability: so.leafValueMutationProbability || 0.5,
    leafSignMutationProbability: so.leafSignMutationProbability || 0.3,
    logicalNodeMutationProbability: so.logicalNodeMutationProbability || 0.3,
    leafIndicatorMutationProbability: so.leafIndicatorMutationProbability || 0.2,
    crossoverProbability: so.crossoverProbability || 0.03,
    indicators: so.indicators ? so.indicators.split(',') : fa_defaultIndicators
  }
}

module.exports = function container (get, set, clear) {
  var c = get('conf')
  
  return function (program) {
    program
      .command('train [selector]')
      .allowUnknownOption()
      .description('Train the binary buy/sell decision tree for the forex.analytics strategy')
      .option('--conf <path>', 'path to optional conf overrides file')
      .option('--period <value>', 'period length of a candlestick (default: 30m)', String, '30m')
      .option('--start_training <timestamp>', 'start training at timestamp')
      .option('--end_training <timestamp>', 'end training at timestamp')
      .option('--days_training <days>', 'set duration of training dataset by day count', Number, c.days)
      .option('--days_test <days>', 'set duration of test dataset to use with simulation, appended AFTER the training dataset (default: 0)', Number)
      .option('--populationCount <value>', 'population count within one generation (default: ' + fa_getTrainOptions().populationCount + ')', Number)
      .option('--generationCount <value>', 'generation count (default: ' + fa_getTrainOptions().generationCount + ')', Number)
      .option('--selectionAmount <value>', 'how many chromosomes shall be selected from the old generation when constructing a new one (default: ' + fa_getTrainOptions().selectionAmount + ')', Number)
      .option('--leafValueMutationProbability <value>', 'leaf value mutation probability (default: ' + fa_getTrainOptions().leafValueMutationProbability + ')', Number)
      .option('--leafSignMutationProbability <value>', 'leaf sign mutation probability (default: ' + fa_getTrainOptions().leafSignMutationProbability + ')', Number)
      .option('--logicalNodeMutationProbability <value>', 'logical node mutation probability (default: ' + fa_getTrainOptions().logicalNodeMutationProbability + ')', Number)
      .option('--leafIndicatorMutationProbability <value>', 'leaf indicator mutation probability (default: ' + fa_getTrainOptions().leafIndicatorMutationProbability + ')', Number)
      .option('--crossoverProbability <value>', 'crossover probability (default: ' + fa_getTrainOptions().crossoverProbability + ')', Number)
      .option('--indicators <value>', 'comma separated list of TA-lib indicators (default: ' + fa_defaultIndicators.toString() + ', available: ' + fa_availableIndicators.toString() + ')', String)

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

        unknownIndicators = []
        if (so.indicators) {
          so.indicators.split(',').forEach(function(indicator) {
            if (!fa_availableIndicators.includes(indicator))
              unknownIndicators.push(indicator)
          })
        }
        if (unknownIndicators.length > 0) {
          console.error(('ERROR: The following indicators are not in forex.analytics: ').red + (unknownIndicators.toString()).yellow)
          console.error('Available indicators: ' + fa_availableIndicators.toString())
          process.exit(1)
        }

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
        so.selector = get('lib.objectify-selector')(selector || c.selector)
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
        var query_start = so.start_training ? tb(so.start_training).resize(so.period_length).subtract(so.min_periods + 2).toMilliseconds() : null
        
        function writeTempModel (strategy) {
          var tempModelString = JSON.stringify(
            {
              "selector": so.selector.normalized,
              "period": so.period_length,
              "start_training": moment(so.start_training),
              "end_training": moment(so.end_training),
              "options": fa_getTrainOptions(so),
              "strategy": strategy
            }, null, 4)

          var tempModelHash = crypto.createHash('sha256').update(tempModelString).digest('hex')
          var tempModelFile = 'models/temp.' + tempModelHash + '-' + moment(so.start_training).utc().format('YYYYMMDD_HHmmssZZ') + '.json';

          fs.writeFileSync(
            tempModelFile,
            tempModelString
          )

          return tempModelFile
        }

        function writeFinalModel (strategy, end_training, trainingResult, testResult) {
          var finalModelString = JSON.stringify(
            {
              "selector": so.selector.normalized,
              "period": so.period_length,
              "start_training": moment(so.start_training).utc(),
              "end_training": moment(end_training).utc(),
              "result_training": trainingResult,
              "start_test": so.days_test > 0 ? moment(end_training).utc() : undefined,
              "result_test": testResult,
              "options": fa_getTrainOptions(so),
              "strategy": strategy
            }, null, 4)

          var testVsBuyHold = typeof(testResult) !== "undefined" ? testResult.vsBuyHold : 'noTest'

          var finalModelFile = 'models/forex.model_' + so.selector.normalized
            + '_period=' + so.period_length
            + '_from=' + moment(so.start_training).utc().format('YYYYMMDD_HHmmssZZ')
            + '_to=' + moment(end_training).utc().format('YYYYMMDD_HHmmssZZ')
            + '_trainingVsBuyHold=' + trainingResult.vsBuyHold
            + '_testVsBuyHold=' + testVsBuyHold
            + '_created=' + moment().utc().format('YYYYMMDD_HHmmssZZ')
            + '.json'

          fs.writeFileSync(
            finalModelFile,
            finalModelString
          )
  
          return finalModelFile
        }
        
        function parseSimulation (simulationResultFile) {
          var endBalance = new RegExp(/end balance: .* \((.*)%\)/)
          var buyHold = new RegExp(/buy hold: .* \((.*)%\)/)
          var vsBuyHold = new RegExp(/vs\. buy hold: (.*)%/)
          var trades = new RegExp(/([0-9].* trades over .* days \(avg (.*) trades\/day\))/)
          var errorRate = new RegExp(/error rate: (.*)%/)

          var simulationResult = fs.readFileSync(simulationResultFile).toString()
          simulationResult = simulationResult.substr(simulationResult.length - 512);

          result = {}
          if (simulationResult.match(endBalance)) { result.endBalance      = simulationResult.match(endBalance)[1] }
          if (simulationResult.match(buyHold))    { result.buyHold         = simulationResult.match(buyHold)[1] }
          if (simulationResult.match(vsBuyHold))  { result.vsBuyHold       = simulationResult.match(vsBuyHold)[1] }
          if (simulationResult.match(trades)) {
            result.trades          = simulationResult.match(trades)[1]
            result.avgTradesPerDay = simulationResult.match(trades)[2]
          }
          if (simulationResult.match(errorRate))  { result.errorRate       = simulationResult.match(errorRate)[1] }

          return result
        }

        function trainingDone (strategy, lastPeriod) {
          var tempModelFile = writeTempModel(strategy)
          console.log("\nModel temporarily written to " + tempModelFile)

          if (typeof(so.end_training) === 'undefined') {
            so.end_training = lastPeriod.time * 1000
          }

          console.log(
              "\nRunning simulation on training data from "
            + moment(so.start_training).format('YYYY-MM-DD HH:mm:ss ZZ') + ' to '
            + moment(so.end_training).format('YYYY-MM-DD HH:mm:ss ZZ') + ".\n"
          )
          
          var zenbot_cmd = process.platform === 'win32' ? 'zenbot.bat' : 'zenbot.sh'; // Use 'win32' for 64 bit windows too
          var trainingArgs = [
            'sim',
            so.selector.normalized,
            '--strategy', 'forex_analytics',
            '--disable_options',
            '--modelfile', path.resolve(__dirname, '..', tempModelFile),
            '--start', so.start_training,
            '--end', so.end_training,
            '--period', so.period_length,
            '--filename', path.resolve(__dirname, '..', tempModelFile) + '-simTrainingResult.html'
          ]
          var trainingSimulation = spawn(path.resolve(__dirname, '..', zenbot_cmd), trainingArgs, { stdio: 'inherit' })

          trainingSimulation.on('exit', function (code, signal) {
            if (code) {
              console.log('Child process exited with code ' + code + ' and signal ' + signal)
              process.exit(code)
            }

            var trainingResult = parseSimulation(path.resolve(__dirname, '..', tempModelFile) + '-simTrainingResult.html')

            if (so.days_test > 0) {
              console.log(
                  "\nRunning simulation on test data from "
                + moment(so.end_training).format('YYYY-MM-DD HH:mm:ss ZZ') + " onwards.\n"
              )
              
              var testArgs = [
                'sim',
                so.selector.normalized,
                '--strategy', 'forex_analytics',
                '--disable_options',
                '--modelfile', path.resolve(__dirname, '..', tempModelFile),
                '--start', so.end_training,
                '--period', so.period_length,
                '--filename', path.resolve(__dirname, '..', tempModelFile) + '-simTestResult.html',
              ]
              var testSimulation = spawn(path.resolve(__dirname, '..', zenbot_cmd), testArgs, { stdio: 'inherit' })

              testSimulation.on('exit', function (code, signal) {
                if (code) {
                  console.log('Child process exited with code ' + code + ' and signal ' + signal)
                }

                var testResult = parseSimulation(path.resolve(__dirname, '..', tempModelFile) + '-simTestResult.html')

                var finalModelFile = writeFinalModel(strategy, so.end_training, trainingResult, testResult)
                fs.rename(path.resolve(__dirname, '..', tempModelFile) + '-simTrainingResult.html', path.resolve(__dirname, '..', finalModelFile) + '-simTrainingResult.html')
                fs.rename(path.resolve(__dirname, '..', tempModelFile) + '-simTestResult.html', path.resolve(__dirname, '..', finalModelFile) + '-simTestResult.html')
                fs.unlink(path.resolve(__dirname, '..', tempModelFile))
                console.log("\nFinal model with results written to " + finalModelFile)

                process.exit(0)
              })
            } else {
              var finalModelFile = writeFinalModel(strategy, so.end_training, trainingResult, undefined)
              fs.rename(path.resolve(__dirname, '..', tempModelFile) + '-simTrainingResult.html', path.resolve(__dirname, '..', finalModelFile) + '-simTrainingResult.html')
              fs.unlink(path.resolve(__dirname, '..', tempModelFile))
              console.log("\nFinal model with results written to " + finalModelFile)

              process.exit(0)
            }
          })
        }

        function createStrategy (candlesticks) {
          var bar = new ProgressBar(
            'Training [:bar] :percent :etas - Fitness: :fitness',
            {
              width: 80,
              total: fa_getTrainOptions(so).generationCount,
              incomplete: ' '
            }
          )

          return analytics.findStrategy(candlesticks, fa_getTrainOptions(so), function(strategy, fitness, generation) {
            bar.tick({
              'fitness': fitness
            })
          })
        }

        function createCandlesticks () {
          console.log()
          
          if (!s.period) {
            console.error('no trades found! try running `zenbot backfill ' + so.selector.normalized + '` first')
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
              trainingDone(strategy, candlesticks[candlesticks.length - 1])
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
              selector: so.selector.normalized
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
