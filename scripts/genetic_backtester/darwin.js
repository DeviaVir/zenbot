#!/usr/bin/env node

/* Zenbot 4 Genetic Backtester
 * Clifford Roche <clifford.roche@gmail.com>
 * 07/01/2017
 *
 * Example: ./darwin.js --selector="bitfinex.ETH-USD" --days="10" --currency_capital="5000" --use_strategies="all | macd,trend_ema,etc" --population="101" --population_data="simulations/generation_data_NUMBERS"
 */

let shell = require('shelljs')
let parallel = require('run-parallel-limit')
let json2csv = require('json2csv')
let roundp = require('round-precision')
let fs = require('fs')
let GeneticAlgorithmCtor = require('geneticalgorithm')
let StripAnsi = require('strip-ansi')
let moment = require('moment')
let tb = require('timebucket')
let path = require('path')
// eslint-disable-next-line no-unused-vars
let colors = require('colors')
let readline = require('readline')
const spawn = require('child_process').spawn
let Phenotypes = require('./phenotype.js')
let argv = require('yargs').argv
let z = require('zero-fill')
let n = require('numbro')
let _ = require('lodash')

let VERSION = 'Zenbot 4 Genetic Backtester v0.2.2'

let PARALLEL_LIMIT = (process.env.PARALLEL_LIMIT && +process.env.PARALLEL_LIMIT) || require('os').cpus().length

let TREND_EMA_MIN = 20
let TREND_EMA_MAX = 20

let OVERSOLD_RSI_MIN = 20
let OVERSOLD_RSI_MAX = 35

let OVERSOLD_RSI_PERIODS_MIN = 15
let OVERSOLD_RSI_PERIODS_MAX = 25

let iterationCount = 0

let selectedStrategies
let pools = {}
let simArgs
let populationSize = 0
let generationCount = 1
let generationProcessing = false

let darwinMonitor = {
  periodDurations: [],
  phenotypes: [],

  actualRange: function(so) {
    // Adapted from sim.js logic to similarly figure out how much time is being processed
    if (so.start) {
      so.start = moment(so.start, 'YYYYMMDDHHmm')
      if (so.days && !so.end) {
        so.end = so.start.clone().add(so.days, 'days')
      }
    }
    if (so.end) {
      so.end = moment(so.end, 'YYYYMMDDHHmm')
      if (so.days && !so.start) {
        so.start = so.end.clone().subtract(so.days, 'days')
      }
    }
    if (!so.start && so.days) {
      so.start = moment().subtract(so.days, 'days')
    }

    if (so.days && !so.end) {
      so.end = so.start.clone().add(so.days, 'days')
    }

    if (so.start && so.end) {
      var actualStart = moment( tb(so.start.valueOf()).resize(so.period_length).subtract(so.min_periods + 2).toMilliseconds() )
      return {
        start: actualStart,
        end: so.end
      }
    }

    return { start: so.start, end: so.end }
  },

  reset: function() {
    this.phenotypes.length = 0
  },

  reportStatus: function() {
    var genCompleted = 0
    // var genTotal = 0

    var simsDone = 0
    var simsActive = 0
    var simsErrored = 0
    var simsAll = populationSize * selectedStrategies.length
    var simsRemaining = simsAll
    // var self = this
    // console.log(`populationSize: ${populationSize}, this.phenotypes: ${this.phenotypes.length}`);

    readline.clearLine(process.stdout)
    readline.cursorTo(process.stdout, 0)

    var inProgress = []
    var inProgressStr = []

    var slowestP = null
    var slowestEta = null

    var bestP = null
    var bestBalance = null

    this.phenotypes.forEach(function(p) {
      if ('sim' in p) {
        if (Object.keys(p.sim).length === 0) {
          simsActive++
          inProgress.push(p)
        }
        else {
          simsDone++

          if (!p.command || !p.command.result)
            simsErrored++

          if (p.command) {
            let balance = p.command.result.endBalance

            if (bestP == null || bestBalance < balance) {
              bestP = p
              bestBalance = balance
            }
            else if (bestP && bestBalance == balance && bestP.command.iteration > p.command.iteration) {
              // Always pick the earliest one so it doesn't look like the number is jumping all over the place
              bestP = p
              bestBalance = balance
            }
          }
        }
        simsRemaining--
      }

    })

    var homeStretchMode = simsActive < (PARALLEL_LIMIT-1) && simsRemaining == 0

    inProgress.forEach(function(p) {
      var c = p.command

      var currentTime
      if (c.currentTimeString) currentTime = moment(c.currentTimeString, 'YYYY-MM-DD HH:mm:ss')
      if (currentTime && currentTime.isBefore(c.queryStart)) c.queryStart = currentTime
      // console.log(`${c.iteration} currentTime: ${currentTime}, queryStart: ${c.queryStart}, queryEnd: ${c.queryEnd}, current: ${c.currentTimeString}`);

      // var timeSoFar = moment().diff(c.startTime);
      // console.log(`remaining: ${time} - ${timeSoFar} = ${time - timeSoFar}`);
      // timeLeft += time - timeSoFar;
      if (currentTime && c.queryStart && c.queryEnd) {
        var totalTime = c.queryEnd.diff(c.queryStart)

        // 2018-01-25 06:18:00
        var progress = currentTime.diff(c.queryStart)

        // console.log(`totalTime: ${totalTime} vs progress: ${progress}`);
        var percentage = progress/totalTime
        genCompleted += percentage

        var now = moment()
        var timeElapsed = now.diff(c.startTime)
        // console.log(`startTime: ${c.startTime}, timeElapsed: ${timeElapsed}, adding: ${timeElapsed / percentage}ms`);
        var eta = c.startTime.clone().add(timeElapsed / percentage, 'milliseconds')

        if (slowestP == null || slowestEta.isBefore(eta)) {
          slowestP = p
          slowestEta = eta
        }

        if (homeStretchMode)
          inProgressStr.push(`${(c.iteration + ':').gray} ${(percentage*100).toFixed(1)}% ETA: ${distanceOfTimeInWords(eta, now)}`)
        else
          inProgressStr.push(`${(c.iteration + ':').gray} ${(percentage*100).toFixed(1)}%`)
      }
    })


    // timeLeft /= simsActive; // how many run at one time
    if (inProgressStr.length > 0) {
      // process.stdout.write("\u001b[1000D") // Move left
      process.stdout.write('\u001b[1A')
      readline.clearLine(process.stdout)
      readline.cursorTo(process.stdout, 0)

      process.stdout.write(inProgressStr.join(', '))
      process.stdout.write('\n')
    }


    var percentage = ((simsDone + genCompleted)/simsAll * 100).toFixed(1)
    // z(8, n(s.period.trend_ema_rate).format('0.0000'), ' ')[color]
    process.stdout.write(`Done: ${simsDone.toString().green}, Active: ${simsActive.toString().yellow}, Remaining: ${simsRemaining.toString().gray}, `)
    if (simsErrored > 0)
      process.stdout.write(`Errored: ${simsErrored.toString().red}, `)

    process.stdout.write(`Completion: ${z(5, (n(percentage).format('0.0') + '%'), ' ').green} `)

    let bestBColor = 'gray'

    if (bestP) {
      if (argv.currency_capital) {
        let cc = parseFloat(argv.currency_capital)
        if (cc < 0.1)
          bestBColor = 'green'
        else if (cc > bestBalance)
          bestBColor = 'red'
        else
          bestBColor = 'yellow'
      }
    }

    let bestBalanceString = z(5, n(bestBalance || 0).format('0.0000'), ' ')[bestBColor]
    process.stdout.write(`Best Balance(${(bestP ? bestP.command.iteration.toString() : '?')[bestBColor]}): ${bestBalanceString}`)

    if (inProgressStr.length > 0) {
      if (!homeStretchMode)
        process.stdout.write(`, Slowest(${slowestP.command.iteration.toString().yellow}) ETA: ${distanceOfTimeInWords(slowestEta, moment()).yellow}`)

    }
  },

  startMonitor: function() {
    process.stdout.write('\n\n')
    this.generationStarted = moment()

    this.reportInterval = setInterval(() => {
      this.reportStatus()
    }, 1000)
  },

  stopMonitor: function() {
    this.generationEnded = moment()
    clearInterval(this.reportInterval)
    var timeStr = distanceOfTimeInWords(this.generationEnded, this.generationStarted)
    console.log(`\n\nGeneration ${generationCount} completed at ${this.generationEnded.format('YYYY-MM-DD HH:mm:ss')}, took ${timeStr}, results saved to:`)
  }
}

let distanceOfTimeInWords = (timeA, timeB) => {
  var hourDiff = timeA.diff(timeB, 'hours')
  let minDiff = 0
  if (hourDiff == 0) {
    minDiff = timeA.diff(timeB, 'minutes')
    var secDiff = timeA.clone().subtract(minDiff, 'minutes').diff(timeB, 'seconds')
    return `${minDiff}m ${secDiff}s`
  }
  else {
    minDiff = timeA.clone().subtract(hourDiff, 'hours').diff(timeB, 'minutes')
    return `${hourDiff}h ${minDiff}m`
  }
}

let ensureDirectoryExistence = (filePath) => {
  var dirname = path.dirname(filePath)
  if (fs.existsSync(dirname)) {
    return true
  }
  ensureDirectoryExistence(dirname)
  fs.mkdirSync(dirname)
}

let writeFileAndFolder = (filePath, data) => {
  ensureDirectoryExistence(filePath)
  fs.writeFile(filePath, data, err => {
    if (err) throw err
  })
}

let buildCommand = (taskStrategyName, phenotype) => {
  var iteration = iterationCount

  var cmdArgs = Object.assign({}, phenotype)
  cmdArgs.strategy = taskStrategyName
  Object.assign(cmdArgs, simArgs)

  var selector = cmdArgs.selector
  delete cmdArgs.selector
  delete cmdArgs.exchangeMarketPair
  delete cmdArgs.sim
  delete cmdArgs.command

  if (argv.include_html)
    cmdArgs.filename = `simulations/${population_data}/gen_${generationCount}/sim_${iteration}_result.html`

  if (argv.silent)
    cmdArgs.silent = true

  let zenbot_cmd = process.platform === 'win32' ? 'zenbot.bat' : './zenbot.sh'
  let command = `${zenbot_cmd} sim ${selector}`

  for (const [ key, value ] of Object.entries(cmdArgs)) {
    if(_.isBoolean(value)){
      command += ` --${value ? '' : 'no-'}${key}`
    } else {
      command += ` --${key}=${value}`
    }
  }

  var actualRange = darwinMonitor.actualRange({
    start: cmdArgs.start, end: cmdArgs.end, days: cmdArgs.days,
    period_length: cmdArgs.period_length, min_periods: (cmdArgs.min_periods || 1)
  })

  return {
    iteration: iteration,
    commandString: command,
    queryStart: actualRange.start,
    queryEnd: actualRange.end
  }
}

let readSimDataFile = (iteration) => {
  let jsonFileName = `simulations/${population_data}/gen_${generationCount}/sim_${iteration}.json`

  if (fs.existsSync(jsonFileName)) {
    let simData = JSON.parse( fs.readFileSync(jsonFileName, { encoding:'utf8' }) )
    return simData
  }
  else {
    return null
  }
}

let writeSimDataFile = (iteration, data) => {
  let jsonFileName = `simulations/${population_data}/gen_${generationCount}/sim_${iteration}.json`
  writeFileAndFolder(jsonFileName, data)
}

let runCommand = (taskStrategyName, phenotype, command, cb) => {
  // console.log(`[ ${command.iteration}/${populationSize * selectedStrategies.length} ] ${command.commandString}`)

  phenotype['sim'] = {}
  phenotype['command'] = command

  command.startTime = moment()
  var cmdArgs = command.commandString.split(' ')
  var cmdName = cmdArgs.shift()
  const proc = spawn(cmdName, cmdArgs)
  var endData = ''

  proc.on('exit', () => {
    let result = null
    let stdout = endData.toString()
    try {
      result = processOutput(stdout,taskStrategyName,phenotype)

      command.endTime = moment()
      command.result = result

      writeSimDataFile(command.iteration, JSON.stringify(command))

      phenotype['sim'] = result
      result['fitness'] = Phenotypes.fitness(phenotype)

      darwinMonitor.reportStatus()

    } catch (err) {
      console.log('Bad output detected', err.toString())
      console.log(stdout)
      console.log(err.stack)
    }

    cb(null, result)
  })
  proc.stdout.on('data', (data) => {
    if (data.length > 500) {
      endData = data
    }
    else {
      var str = StripAnsi(data.toString()), lines = str.split(/(\r?\n)/g)
      for (var i=0; i<lines.length; i++) {
        var line = lines[i]
        if (line.indexOf('-') == 4 && line.indexOf(':') == 13) {
          var timeStr = line.slice(0, 20)
          command.currentTimeString = timeStr
          // console.log(`${command.iteration}: ${command.currentTimeString}`)
        }
      }

    }
  })
}

function  runUpdate  (days, selector) {
  let zenbot_cmd = process.platform === 'win32' ? 'zenbot.bat' : './zenbot.sh'
  let command = `${zenbot_cmd} backfill --days=${days} ${selector}`
  console.log('Backfilling (might take some time) ...')
  console.log(command)

  shell.exec(command, {
    silent: true,
    async: false
  })
}

function processOutput  (output,taskStrategyName, pheno) {


  // let strippedOutput = StripAnsi(output)
  // let output2 = strippedOutput.substr(strippedOutput.length - 3500)

  let tFileName = path.resolve(__dirname, '..','..', 'simulations','sim_'+taskStrategyName.replace('_','')+'_'+ pheno.exchangeMarketPair.toLowerCase().replace('_','')+'_'+pheno.backtester_generation+'.json')
  let simulationResults

  let params
  let endBalance
  let buyHold
  let vsBuyHold
  //let wlMatch
  //let errMatch
  let wins
  let losses
  let errorRate
  let days
  let start
  let end
  // This can retrieve the results from 2 different places.  It defaults to reading it from the json file
  // but if no file is found it will fall back to the older metheod of scraping the output of the sim process
  // stdio scraping to be removed after full verification of functionality.
  // todo: see above comment
  if (fs.existsSync(tFileName))
  {
    let jsonBuffer
    jsonBuffer = fs.readFileSync(tFileName,{encoding:'utf8'})
    simulationResults = JSON.parse(jsonBuffer)
    fs.unlinkSync(tFileName)
  }


  if (typeof(simulationResults) === 'object'  )
  {
    params = simulationResults
    endBalance = simulationResults.simresults.currency
    buyHold = simulationResults.simresults.buy_hold
    vsBuyHold = simulationResults.simresults.vs_buy_hold
    //wlMatch = (simulationResults.simresults.total_sells - simulationResults.simresults.total_losses) +'/'+ simulationResults.simresults.total_losses
    wins          = simulationResults.simresults.total_sells - simulationResults.simresults.total_losses
    losses        = simulationResults.simresults.total_losses
    errorRate     = simulationResults.simresults.total_losses / simulationResults.simresults.total_sells
    days = parseInt(simulationResults.days)
    start = parseInt(simulationResults.start)
    end = parseInt(simulationResults.end || null)
  }
  else {
    console.log(`Couldn't find simulationResults for ${pheno.backtester_generation}`)
  }

  let roi
  if  (params.currency_capital == 0.0)
  {
    roi = roundp(endBalance, 3 )
  }
  else
  {
    roi = roundp(((endBalance - params.currency_capital) / params.currency_capital) * 100, 3 )
  }

  //todo: figure out what this is trying to do.
  let r = params
  delete r.asset_capital
  delete r.buy_pct
  delete r.currency_capital
  delete r.days
  delete r.mode
  delete r.order_adjust_time
  delete r.population
  delete r.population_data
  delete r.sell_pct
  delete r.start
  delete r.end
  delete r.stats
  delete r.use_strategies
  delete r.verbose
  delete r.simresults
  r.selector = r.selector.normalized

  if (start) {
    r.start = moment(start).format('YYYYMMDDHHmm')
  }
  if (end) {
    r.end = moment(end).format('YYYYMMDDHHmm')
  }
  if (!start && !end && params.days) {
    r.days = params.days
  }

  let results = {
    params: 'module.exports = ' + JSON.stringify(r),
    endBalance: parseFloat(endBalance),
    buyHold: parseFloat(buyHold),
    vsBuyHold: parseFloat(vsBuyHold) || vsBuyHold,
    wins: wins,
    losses: losses,
    errorRate: parseFloat(errorRate),
    days: days,
    period_length: params.period_length,
    min_periods: params.min_periods,
    markdown_buy_pct: params.markdown_buy_pct,
    markup_sell_pct: params.markup_sell_pct,
    order_type: params.order_type,
    wlRatio: losses > 0 ? roundp(wins / losses, 3) : 'Infinity',
    roi: roi,
    selector: params.selector,
    strategy: params.strategy,
    frequency: roundp((wins + losses) / days, 3)
  }



  return results
}

function Range  (min, max)  {
  var r = {
    type: 'int',
    min: min,
    max: max
  }
  return r
}

function Range0 (min, max)  {
  var r = {
    type: 'int0',
    min: min,
    max: max
  }
  return r
}

function RangeFactor  (min, max, factor)  {
  var r = {
    type: 'intfactor',
    min: min,
    max: max,
    factor: factor
  }
  return r
}


function RangeFloat  (min, max)  {
  var r = {
    type: 'float',
    min: min,
    max: max
  }
  return r
}

function RangePeriod  (min, max, period_length)  {
  var r = {
    type: 'period_length',
    min: min,
    max: max,
    period_length: period_length
  }
  return r
}

function RangeMakerTaker  ()  {
  var r = {
    type: 'makertaker'
  }
  return r
}

function RangeNeuralActivation  () {
  var r = {
    type: 'sigmoidtanhrelu'
  }
  return r
}
function RangeBoolean  () {
  var r = {
    type: 'truefalse'
  }
  return r
}

const strategies = {
  bollinger: {
    // -- common
    period_length: RangePeriod(1, 120, 'm'),
    markdown_buy_pct: RangeFloat(-1, 5),
    markup_sell_pct: RangeFloat(-1, 5),
    order_type: RangeMakerTaker(),
    sell_stop_pct: Range0(1, 50),
    buy_stop_pct: Range0(1, 50),
    profit_stop_enable_pct: Range0(1, 20),
    profit_stop_pct: Range(1,20),

    // -- strategy
    bollinger_size: Range(1, 40),
    bollinger_time: RangeFloat(1,6),
    bollinger_upper_bound_pct: RangeFloat(-1, 30),
    bollinger_lower_bound_pct: RangeFloat(-1, 30)
  },
  cci_srsi: {
    // -- common
    period_length: RangePeriod(1, 120, 'm'),
    min_periods: Range(1, 200),
    markdown_buy_pct: RangeFloat(-1, 5),
    markup_sell_pct: RangeFloat(-1, 5),
    order_type: RangeMakerTaker(),
    sell_stop_pct: Range0(1, 50),
    buy_stop_pct: Range0(1, 50),
    profit_stop_enable_pct: Range0(1, 20),
    profit_stop_pct: Range(1,20),

    // -- strategy
    ema_acc: RangeFloat(0, 0.5),
    cci_periods: Range(1, 200),
    rsi_periods: Range(1, 200),
    srsi_periods: Range(1, 200),
    srsi_k: Range(1, 50),
    srsi_d: Range(1, 50),
    oversold_rsi: Range(1, 100),
    overbought_rsi: Range(1, 100),
    oversold_cci: Range(-100, 100),
    overbought_cci: Range(1, 100),
    constant: RangeFloat(0.001, 0.05)
  },
  crossover_vwap: {
    // -- common
    period_length: RangePeriod(1, 400, 'm'),
    min_periods: Range(1, 200),
    markdown_buy_pct: RangeFloat(-1, 5),
    markup_sell_pct: RangeFloat(-1, 5),
    order_type: RangeMakerTaker(),
    sell_stop_pct: Range0(1, 50),
    buy_stop_pct: Range0(1, 50),
    profit_stop_enable_pct: Range0(1, 20),
    profit_stop_pct: Range(1,20),

    // -- strategy
    emalen1: Range(1, 300),
    smalen1: Range(1, 300),
    smalen2: Range(1, 300),
    vwap_length: Range(1, 300),
    vwap_max: RangeFactor(0, 10000, 10)//0 disables this max cap. Test in increments of 10
  },
  dema: {
    // -- common
    period_length: RangePeriod(1, 120, 'm'),
    min_periods: Range(1, 200),
    markdown_buy_pct: RangeFloat(-1, 5),
    markup_sell_pct: RangeFloat(-1, 5),
    order_type: RangeMakerTaker(),
    sell_stop_pct: Range0(1, 50),
    buy_stop_pct: Range0(1, 50),
    profit_stop_enable_pct: Range0(1, 20),
    profit_stop_pct: Range(1,20),

    // -- strategy
    ema_short_period: Range(1, 20),
    ema_long_period: Range(20, 100),
    up_trend_threshold: Range(0, 50),
    down_trend_threshold: Range(0, 50),
    overbought_rsi_periods: Range(1, 50),
    overbought_rsi: Range(20, 100)
  },
  macd: {
    // -- common
    period_length: RangePeriod(1, 120, 'm'),
    min_periods: Range(1, 200),
    markdown_buy_pct: RangeFloat(-1, 5),
    markup_sell_pct: RangeFloat(-1, 5),
    order_type: RangeMakerTaker(),
    sell_stop_pct: Range0(1, 50),
    buy_stop_pct: Range0(1, 50),
    profit_stop_enable_pct: Range0(1, 20),
    profit_stop_pct: Range(1,20),

    // -- strategy
    ema_short_period: Range(1, 20),
    ema_long_period: Range(20, 100),
    signal_period: Range(1, 20),
    up_trend_threshold: Range(0, 50),
    down_trend_threshold: Range(0, 50),
    overbought_rsi_periods: Range(1, 50),
    overbought_rsi: Range(20, 100)
  },
  momentum: {
    // -- common
    period_length: RangePeriod(1, 120, 'm'),
    min_periods: Range(1, 2500),
    markdown_buy_pct: RangeFloat(-1, 5),
    markup_sell_pct: RangeFloat(-1, 5),
    order_type: RangeMakerTaker(),
    sell_stop_pct: Range0(1, 50),
    buy_stop_pct: Range0(1, 50),
    profit_stop_enable_pct: Range0(1, 20),
    profit_stop_pct: Range(1,20),

    // -- strategy
    momentum_size: Range(1,20)
  },
  neural: {
    // -- common
    period_length: RangePeriod(1, 120, 'm'),
    min_periods: Range(1, 200),
    markdown_buy_pct: RangeFloat(-1, 5),
    markup_sell_pct: RangeFloat(-1, 5),
    order_type: RangeMakerTaker(),
    sell_stop_pct: Range0(1, 50),
    buy_stop_pct: Range0(1, 50),
    profit_stop_enable_pct: Range0(1, 20),
    profit_stop_pct: Range(1,20),

    // -- strategy
    neurons_1: Range(1, 200),
    activation_1_type: RangeNeuralActivation(),
    depth: Range(1, 100),
    min_predict: Range(1, 100),
    momentum: Range(0, 100),
    decay: Range(1, 10),
    learns: Range(1, 200)
  },
  rsi: {
    // -- common
    period_length: RangePeriod(1, 120, 'm'),
    min_periods: Range(1, 200),
    markdown_buy_pct: RangeFloat(-1, 5),
    markup_sell_pct: RangeFloat(-1, 5),
    order_type: RangeMakerTaker(),
    sell_stop_pct: Range0(1, 50),
    buy_stop_pct: Range0(1, 50),
    profit_stop_enable_pct: Range0(1, 20),
    profit_stop_pct: Range(1,20),

    // -- strategy
    rsi_periods: Range(1, 200),
    oversold_rsi: Range(1, 100),
    overbought_rsi: Range(1, 100),
    rsi_recover: Range(1, 100),
    rsi_drop: Range(0, 100),
    rsi_divisor: Range(1, 10)
  },
  sar: {
    // -- common
    period_length: RangePeriod(1, 120, 'm'),
    min_periods: Range(2, 100),
    markdown_buy_pct: RangeFloat(-1, 5),
    markup_sell_pct: RangeFloat(-1, 5),
    order_type: RangeMakerTaker(),
    sell_stop_pct: Range0(1, 50),
    buy_stop_pct: Range0(1, 50),
    profit_stop_enable_pct: Range0(1, 20),
    profit_stop_pct: Range(1,20),

    // -- strategy
    sar_af: RangeFloat(0.01, 1.0),
    sar_max_af: RangeFloat(0.01, 1.0)
  },
  speed: {
    // -- common
    period_length: RangePeriod(1, 120, 'm'),
    min_periods: Range(1, 100),
    markdown_buy_pct: RangeFloat(-1, 5),
    markup_sell_pct: RangeFloat(-1, 5),
    order_type: RangeMakerTaker(),
    sell_stop_pct: Range0(1, 50),
    buy_stop_pct: Range0(1, 50),
    profit_stop_enable_pct: Range0(1, 20),
    profit_stop_pct: Range(1,20),

    // -- strategy
    baseline_periods: Range(1, 5000),
    trigger_factor: RangeFloat(0.1, 10)
  },
  srsi_macd: {
    // -- common
    period_length: RangePeriod(1, 120, 'm'),
    min_periods: Range(1, 200),
    markdown_buy_pct: RangeFloat(-1, 5),
    markup_sell_pct: RangeFloat(-1, 5),
    order_type: RangeMakerTaker(),
    sell_stop_pct: Range0(1, 50),
    buy_stop_pct: Range0(1, 50),
    profit_stop_enable_pct: Range0(1, 20),
    profit_stop_pct: Range(1,20),

    // -- strategy
    rsi_periods: Range(1, 200),
    srsi_periods: Range(1, 200),
    srsi_k: Range(1, 50),
    srsi_d: Range(1, 50),
    oversold_rsi: Range(1, 100),
    overbought_rsi: Range(1, 100),
    ema_short_period: Range(1, 20),
    ema_long_period: Range(20, 100),
    signal_period: Range(1, 20),
    up_trend_threshold: Range(0, 20),
    down_trend_threshold: Range(0, 20)
  },
  stddev: {
    // -- common
    // reference in extensions is given in ms have not heard of an exchange that supports 500ms thru api so setting min at 1 second
    period_length: RangePeriod(1, 7200, 's'),
    min_periods: Range(1, 2500),
    markdown_buy_pct: RangeFloat(-1, 5),
    markup_sell_pct: RangeFloat(-1, 5),
    order_type: RangeMakerTaker(),
    sell_stop_pct: Range0(1, 50),
    buy_stop_pct: Range0(1, 50),
    profit_stop_enable_pct: Range0(1, 20),
    profit_stop_pct: Range(1,20),

    // -- strategy
    trendtrades_1: Range(2, 20),
    trendtrades_2: Range(4, 100)
  },
  ta_ema: {
    // -- common
    period_length: RangePeriod(1, 120, 'm'),
    min_periods: Range(1, 100),
    markdown_buy_pct: RangeFloat(-1, 5),
    markup_sell_pct: RangeFloat(-1, 5),
    order_type: RangeMakerTaker(),
    sell_stop_pct: Range0(1, 50),
    buy_stop_pct: Range0(1, 50),
    profit_stop_enable_pct: Range0(1, 20),
    profit_stop_pct: Range(1,20),

    // -- strategy
    trend_ema: Range(TREND_EMA_MIN, TREND_EMA_MAX),
    oversold_rsi_periods: Range(OVERSOLD_RSI_PERIODS_MIN, OVERSOLD_RSI_PERIODS_MAX),
    oversold_rsi: Range(OVERSOLD_RSI_MIN, OVERSOLD_RSI_MAX)
  },
  ta_macd: {
    // -- common
    period_length: RangePeriod(1, 120, 'm'),
    min_periods: Range(1, 200),
    markdown_buy_pct: RangeFloat(-1, 5),
    markup_sell_pct: RangeFloat(-1, 5),
    order_type: RangeMakerTaker(),
    sell_stop_pct: Range0(1, 50),
    buy_stop_pct: Range0(1, 50),
    profit_stop_enable_pct: Range0(1, 20),
    profit_stop_pct: Range(1,20),

    // -- strategy
    // have to be minimum 2 because talib will throw an "TA_BAD_PARAM" error
    ema_short_period: Range(2, 20),
    ema_long_period: Range(20, 100),
    signal_period: Range(1, 20),
    up_trend_threshold: Range(0, 50),
    down_trend_threshold: Range(0, 50),
    overbought_rsi_periods: Range(1, 50),
    overbought_rsi: Range(20, 100)
  },
  trend_bollinger: {
    // -- common
    period_length: RangePeriod(1, 120, 'm'),
    markdown_buy_pct: RangeFloat(-1, 5),
    markup_sell_pct: RangeFloat(-1, 5),
    order_type: RangeMakerTaker(),
    sell_stop_pct: Range0(1, 50),
    buy_stop_pct: Range0(1, 50),
    profit_stop_enable_pct: Range0(1, 20),
    profit_stop_pct: Range(1,20),

    // -- strategy
    bollinger_size: Range(1, 40),
    bollinger_time: RangeFloat(1,6),
    bollinger_upper_bound_pct: RangeFloat(-1, 30),
    bollinger_lower_bound_pct: RangeFloat(-1, 30)
  },
  trend_ema: {
    // -- common
    period_length: RangePeriod(1, 120, 'm'),
    min_periods: Range(1, 100),
    markdown_buy_pct: RangeFloat(-1, 5),
    markup_sell_pct: RangeFloat(-1, 5),
    order_type: RangeMakerTaker(),
    sell_stop_pct: Range0(1, 50),
    buy_stop_pct: Range0(1, 50),
    profit_stop_enable_pct: Range0(1, 20),
    profit_stop_pct: Range(1,20),

    // -- strategy
    trend_ema: Range(TREND_EMA_MIN, TREND_EMA_MAX),
    oversold_rsi_periods: Range(OVERSOLD_RSI_PERIODS_MIN, OVERSOLD_RSI_PERIODS_MAX),
    oversold_rsi: Range(OVERSOLD_RSI_MIN, OVERSOLD_RSI_MAX)
  },
  trendline: {
    // -- common
    period_length: RangePeriod(1, 400, 'm'),
    min_periods: Range(1, 200),
    markdown_buy_pct: RangeFloat(-1, 5),
    markup_sell_pct: RangeFloat(-1, 5),
    order_type: RangeMakerTaker(),
    sell_stop_pct: Range0(1, 50),
    buy_stop_pct: Range0(1, 50),
    profit_stop_enable_pct: Range0(1, 20),
    profit_stop_pct: Range(1,20),

    // -- strategy
    lastpoints: Range(20, 500),
    avgpoints: Range(300, 3000),
    lastpoints2: Range(5, 300),
    avgpoints2: Range(50, 1000),
  },
  trust_distrust: {
    // -- common
    period_length: RangePeriod(1, 120, 'm'),
    min_periods: Range(1, 100),
    markdown_buy_pct: RangeFloat(-1, 5),
    markup_sell_pct: RangeFloat(-1, 5),
    order_type: RangeMakerTaker(),
    sell_stop_pct: Range0(1, 50),
    buy_stop_pct: Range0(1, 50),
    profit_stop_enable_pct: Range0(1, 20),
    profit_stop_pct: Range(1,20),

    // -- strategy
    sell_threshold: Range(1, 100),
    sell_threshold_max: Range0(1, 100),
    sell_min: Range(1, 100),
    buy_threshold: Range(1, 100),
    buy_threshold_max: Range0(1, 100),
    greed: Range(1, 100)
  },
  wavetrend: {
    // -- common
    period_length: RangePeriod(1, 120, 'm'),
    min_periods: Range(1, 200),
    markdown_buy_pct: RangeFloat(-1, 5),
    markup_sell_pct: RangeFloat(-1, 5),
    order_type: RangeMakerTaker(),
    sell_stop_pct: Range0(1, 50),
    buy_stop_pct: Range0(1, 50),
    profit_stop_enable_pct: Range0(1, 20),
    profit_stop_pct: Range(1,20),

    // -- strategy
    wavetrend_channel_length: Range(1,20),
    wavetrend_average_length: Range(1,42),
    wavetrend_overbought_1: Range(1, 100),
    wavetrend_overbought_2: Range(1,100),
    wavetrend_oversold_1: Range(-100,0),
    wavetrend_oversold_2: Range(-100,0),
    wavetrend_trends: RangeBoolean()
  }
}

function allStrategyNames ()  {
  let r = []
  for (var k in strategies) {
    r.push(k)
  }
  return r
}

function isUsefulKey  (key)  {
  if(key == 'filename' || key == 'show_options' || key == 'sim') return false
  return true
}

function generateCommandParams (input)  {
  input = input.params.replace('module.exports =','')
  input = JSON.parse(input)

  var result = ''
  var keys = Object.keys(input)
  for(let i = 0;i < keys.length;i++){
    var key = keys[i]
    if(isUsefulKey(key)){
      // selector should be at start before keys
      if(key == 'selector'){
        result = input[key] + result
      }

      else result += ' --'+key+'='+input[key]
    }

  }
  return result
}

function  saveGenerationData (csvFileName, jsonFileName, dataCSV, dataJSON) {
  try {
    fs.writeFileSync(csvFileName, dataCSV)
    console.log('> Finished writing generation csv to ' + csvFileName)
  }
  catch (err) {
    throw err
  }

  try {
    fs.writeFileSync(jsonFileName, dataJSON)
    console.log('> Finished writing generation json to ' + jsonFileName)
  }
  catch (err) {
    throw err
  }
}

let population_data = argv.population_data || `backtest_${moment().format('YYYYMMDDHHmm')}`

// Find the first incomplete generation of this session, where incomplete means no "results" files
while (fs.existsSync(`simulations/${population_data}/gen_${generationCount}`)) { generationCount++ }
generationCount--
if (generationCount > 0 && !fs.existsSync(`simulations/${population_data}/gen_${generationCount}/results.csv`)) { generationCount-- }

function saveLaunchFiles(saveLauchFile, configuration ){
  if (!saveLauchFile) return
  //let lConfiguration = configuration.replace(' sim ', ' trade ')
  let lFilenameNix = new String().concat('./gen.',configuration.selector.toLowerCase(),'.sh')
  let lFinenamewin32 = new String().concat('./gen.',configuration.selector.toLowerCase(),'.bat')
  delete configuration.generateLaunch
  delete configuration.backtester_generation

  let bestOverallCommand = generateCommandParams(configuration)
  let lastFitnessLevel = -9999.0
  // get prior fitness level nix
  if (fs.existsSync(lFilenameNix) )
  {
    let lFileCont = fs.readFileSync(lFilenameNix,{encoding:'utf8',flag:'r'})
    let lines = lFileCont.split('\n')
    if (lines.length > 2) 
      if (lines[1].includes('fitness='))
      {
        let th = lines[1].split('=')
        lastFitnessLevel = th[1]
      }
  }
  // get prior firness level win32
  if (fs.existsSync(lFinenamewin32) )
  {
    let lFileCont = fs.readFileSync(lFinenamewin32,{encoding:'utf8',flag:'r'})
    let lines = lFileCont.split('\n')
    if (lines.length > 1) 
      if (lines[1].includes('fitness='))
      {
        let th = lines[1].split('=')
        lastFitnessLevel = th[1]
      }
  }
  
  //write Nix Version
  let lNixContents = '#!/bin/bash\n'.concat('#fitness=',configuration.fitness,'\n',
    'env node zenbot.js trade ', 
    bestOverallCommand,' $@\n')
  let lWin32Contents = '@echo off\n'.concat('rem fitness=',configuration.fitness,'\n',
    'node zenbot.js trade ', 
    bestOverallCommand,' %*\n')
  
  if (Number(configuration.fitness) > Number(lastFitnessLevel))
  {
    fs.writeFileSync(lFilenameNix, lNixContents)
    fs.writeFileSync(lFinenamewin32, lWin32Contents)
    // using the string instead of octet as eslint compaines about an invalid number if the number starts with 0
    fs.chmodSync(lFilenameNix, '777')
    fs.chmodSync(lFinenamewin32, '777')
  }
}

function simulateGeneration  (generateLaunchFile) {

// Find the first incomplete generation of this session, where incomplete means no "results" files
  while (fs.existsSync(`simulations/${population_data}/gen_${generationCount}`)) { generationCount++ }
  generationCount--
  if (generationCount > 0 && !fs.existsSync(`simulations/${population_data}/gen_${generationCount}/results.csv`)) { generationCount-- }

  generationProcessing = true
  console.log(`\n\n=== Simulating generation ${++generationCount} ===\n`)
  darwinMonitor.reset()

  let days = argv.days
  if (!days) {
    if (argv.start) {
      var start = moment(argv.start, 'YYYYMMDDHHmm')
      days = Math.max(1, moment().diff(start, 'days'))
    }
    else {
      var end = moment(argv.end, 'YYYYMMDDHHmm')
      days = moment().diff(end, 'days') + 1
    }
  }
  iterationCount = 1
  if (iterationCount == 1)
    runUpdate(days, argv.selector)


  let tasks = selectedStrategies.map(v => pools[v]['pool'].population().map(phenotype => {

    return cb => {
      phenotype.backtester_generation = iterationCount
      phenotype.exchangeMarketPair = argv.selector
      darwinMonitor.phenotypes.push(phenotype)

      var command
      let simData = readSimDataFile(iterationCount)
      if (simData) {
        if (simData.result) {
          // Found a complete and cached sim, don't run anything, just forward the results of it
          phenotype['sim'] = simData.result
          iterationCount++
          return cb(null, simData.result)
        }
        else {
          command = {
            iteration: iterationCount,
            commandString: simData.commandString,
            queryStart: moment(simData.queryStart),
            queryEnd: moment(simData.queryEnd)
          }
        }
      }

      if (!command) {
        // Default flow, build the command to run, and cache it so there's no need to duplicate work when resuming
        command = buildCommand(v, phenotype)
        writeSimDataFile(iterationCount, JSON.stringify(command))
      }

      iterationCount++
      runCommand(v, phenotype, command, cb)
    }
  })).reduce((a, b) => a.concat(b))

  darwinMonitor.startMonitor()

  parallel(tasks, PARALLEL_LIMIT, (err, results) => {
    darwinMonitor.stopMonitor()

    results = results.filter(function(r) {
      return !!r
    })

    results.sort((a, b) => (Number(a.fitness) < Number(b.fitness)) ? 1 : ((Number(b.fitness) < Number(a.fitness)) ? -1 : 0))

    let fieldsGeneral = ['selector.normalized', 'fitness', 'vsBuyHold', 'wlRatio', 'frequency', 'strategy', 'order_type', 'endBalance', 'buyHold', 'wins', 'losses', 'period_length', 'min_periods', 'days', 'params']
    let fieldNamesGeneral = ['Selector', 'Fitness', 'VS Buy Hold (%)', 'Win/Loss Ratio', '# Trades/Day', 'Strategy', 'Order Type', 'Ending Balance ($)', 'Buy Hold ($)', '# Wins', '# Losses', 'Period', 'Min Periods', '# Days', 'Full Parameters']

    let dataCSV = json2csv({
      data: results,
      fields: fieldsGeneral,
      fieldNames: fieldNamesGeneral
    })
    let csvFileName = `simulations/${population_data}/gen_${generationCount}/results.csv`

    let poolData = {}
    selectedStrategies.forEach(function(v) {
      poolData[v] = pools[v]['pool'].population()
    })

    let jsonFileName = `simulations/${population_data}/gen_${generationCount}/results.json`
    let dataJSON = JSON.stringify(poolData, null, 2)
    saveGenerationData(csvFileName, jsonFileName, dataCSV, dataJSON )


    //Display best of the generation
    console.log('\n\nGeneration\'s Best Results')
    let bestOverallResult = []
    let prefix = './zenbot.sh sim '
    selectedStrategies.forEach((v)=> {
      let best = pools[v]['pool'].best()
      let bestCommand
      if(best.sim){
        console.log(`(${best.sim.strategy}) Sim Fitness ${best.sim.fitness}, VS Buy and Hold: ${z(5, (n(best.sim.vsBuyHold).format('0.0') + '%'), ' ').yellow} BuyAndHold Balance: ${z(5, (n(best.sim.buyHold).format('0.000000')), ' ').yellow}  End Balance: ${z(5, (n(best.sim.endBalance).format('0.000000')), ' ').yellow}, Wins/Losses ${best.sim.wins}/${best.sim.losses}, ROI ${z(5, (n(best.sim.roi).format('0.000000')), ' ').yellow}.`)
        bestCommand = generateCommandParams(best.sim)
        bestOverallResult.push(best.sim)
      } else {
        console.log(`(${results[0].strategy}) Result Fitness ${results[0].fitness}, VS Buy and Hold: ${z(5, (n(results[0].vsBuyHold).format('0.0') + '%'), ' ').yellow} BuyAndHold Balance: ${z(5, (n(results[0].buyHold).format('0.000000')), ' ').yellow}  End Balance: ${z(5, (n(results[0].endBalance).format('0.000000')), ' ').yellow}, Wins/Losses ${results[0].wins}/${results[0].losses}, ROI ${z(5, (n(results.roi).format('0.000000') ), ' ').yellow}.`)
        bestCommand = generateCommandParams(results[0])
        bestOverallResult.push(results[0])
      }

      // prepare command snippet from top result for this strat

      bestCommand = prefix + bestCommand
      bestCommand = bestCommand + ' --asset_capital=' + argv.asset_capital + ' --currency_capital=' + argv.currency_capital
      console.log(bestCommand + '\n')
    })

    bestOverallResult.sort((a, b) => (a.fitness < b.fitness) ? 1 : ((b.fitness < a.fitness) ? -1 : 0))
    // if (selectedStrategies.length > 1){
    //     }

    
    let bestOverallCommand = generateCommandParams(bestOverallResult[0])
    bestOverallCommand = prefix + bestOverallCommand
    bestOverallCommand = bestOverallCommand + ' --asset_capital=' + argv.asset_capital + ' --currency_capital=' + argv.currency_capital
    

    saveLaunchFiles(generateLaunchFile, bestOverallResult[0])



    if (selectedStrategies.length > 1) {
      console.log(`(${bestOverallResult[0].strategy}) Best Overall Fitness ${bestOverallResult[0].fitness}, VS Buy and Hold: ${z(5, (n(bestOverallResult[0].vsBuyHold).format('0.00') + '%'), ' ').yellow} BuyAndHold Balance: ${z(5, (n(bestOverallResult[0].buyHold).format('0.000000')), ' ').yellow}  End Balance: ${z(5, (n(bestOverallResult[0].endBalance).format('0.000000')), ' ').yellow}, Wins/Losses ${bestOverallResult[0].wins}/${bestOverallResult[0].losses}, ROI ${z(5, (n(bestOverallResult[0].roi).format('0.000000')), ' ').yellow}.`)

      console.log(bestOverallCommand + '\n')
    }

    selectedStrategies.forEach((v)=> {
      pools[v]['pool'] = pools[v]['pool'].evolve()
    })

    generationProcessing = false


  })
}



console.log(`\n--==${VERSION}==--`)
console.log(new Date().toUTCString() + '\n')


simArgs = Object.assign({}, argv)
if (!simArgs.selector)
  simArgs.selector = 'bitfinex.ETH-USD'
if (!simArgs.filename)
  simArgs.filename = 'none'

if (simArgs.help || !(simArgs.use_strategies)) 
{
  console.log('--use_strategies=<stragegy_name>,<stragegy_name>,<stragegy_name>   Min one strategy, can include more than one')
  console.log('--population_data=<filename>    filename used for continueing backtesting from previous run')
  console.log('--generateLaunch=<true>|<false>        will genertate .sh and .bat file using the best generation discovered')
  console.log('--population=<int>    populate per strategy')
  console.log('--maxCores=<int>    maximum processes to execute at a time default is # of cpu cores in system')
  console.log('--selector=<exchange.marketPair>  ')
  console.log('--asset_capital=<float>    amount coin to start sim with ')
  console.log('--currency_capital=<float>  amount of capital/base currency to start sim with'),
  console.log('--days=<int>  amount of days to use when backfilling')
  process.exit(0)
}


delete simArgs.use_strategies
delete simArgs.population_data
delete simArgs.population
delete simArgs['$0'] // This comes in to argv all by itself
delete simArgs['_']  // This comes in to argv all by itself

if (simArgs.maxCores)
{
  if (simArgs.maxCores < 1) PARALLEL_LIMIT = 1
  else
    PARALLEL_LIMIT = simArgs.maxCores
}

let generateLaunchFile = (simArgs.generateLaunch) ? true : false
let strategyName = (argv.use_strategies) ? argv.use_strategies : 'all'
// let populationFileName = (argv.population_data) ? argv.population_data : null
populationSize = (argv.population) ? argv.population : 100




console.log(`Backtesting strategy ${strategyName} ...\n`)
console.log(`Creating population of ${populationSize} ...\n`)

selectedStrategies = (strategyName === 'all') ? allStrategyNames() : strategyName.split(',')

//Clean up any generation files left over in the simulation directory
//they will be overwritten, but best not to confuse the issue.
//if it fails.   doesn't matter they will be overwritten anyways. not need to halt the system.
try
{
  let tDirName = path.resolve(__dirname, '..','..', 'simulations')
  let tFileName = 'sim_'
  let files = fs.readdirSync(tDirName)

  for(let i = 0; i < files.length; i++)
  {
    if (files[i].lastIndexOf(tFileName) == 0)
    {
      let filePath = path.resolve(__dirname, '..','..', 'simulations',files[i] )
      fs.unlinkSync(filePath)
    }

  }
} catch (err)
{
  console.log('error deleting lint from prior run')
}


for (var i = 0; i < selectedStrategies.length; i++)
{
  let v = selectedStrategies[i]
  let strategyPool = pools[v] = {}

  let evolve = true
  let population = []
  for (var i2 = population.length; i2 < populationSize; ++i2) {
    population.push(Phenotypes.create(strategies[v]))
    evolve = false
  }

  strategyPool['config'] = {
    mutationFunction: function(phenotype) {
      return Phenotypes.mutation(phenotype, strategies[v])
    },
    crossoverFunction: function(phenotypeA, phenotypeB) {
      return Phenotypes.crossover(phenotypeA, phenotypeB, strategies[v])
    },
    fitnessFunction: Phenotypes.fitness,
    doesABeatBFunction: Phenotypes.competition,
    population: population,
    populationSize: populationSize
  }

  strategyPool['pool'] = GeneticAlgorithmCtor(strategyPool.config)
  if (evolve) {
    strategyPool['pool'].evolve()
  }
}

// BEGIN - exitHandler
var exitHandler = function(options, exitErr) {

  if (generationCount && options.cleanup) {
    console.log('Resume this backtest later with:')
    var darwin_args = process.argv.slice(2, process.argv.length)

    var hasPopData = false
    var popDataArg = `--population_data=${population_data}`
    darwin_args.forEach(function(arg) {
      if (arg === popDataArg) {
        hasPopData = true
      }
    })

    if (!hasPopData) {
      darwin_args.push(popDataArg)
    }

    console.log(`./scripts/genetic_backtester/darwin.js ${darwin_args.join(' ')}`)
  }

  if (exitErr) console.log(exitErr.stack || exitErr)
  if (options.exit) process.exit()
}
process.on('exit', exitHandler.bind(null,{cleanup:true}))

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}))

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}))
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}))

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}))
// END - exitHandler


setInterval( ()=>{
  if (generationProcessing == false)  simulateGeneration(generateLaunchFile)
},1000)
