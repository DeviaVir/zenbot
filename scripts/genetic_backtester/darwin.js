#!/usr/bin/env node

/* Zenbot 4 Genetic Backtester
 * Clifford Roche <clifford.roche@gmail.com>
 * 07/01/2017
 *
 * Example: ./darwin.js --selector="bitfinex.ETH-USD" --days="10" --currency_capital="5000" --use_strategies="all | macd,trend_ema,etc" --population="101" --population_data="simulations/generation_data_NUMBERS_gen_X.json"
 */

let shell = require('shelljs')
let parallel = require('run-parallel-limit')
let json2csv = require('json2csv')
let roundp = require('round-precision')
let fs = require('fs')
let GeneticAlgorithmCtor = require('geneticalgorithm')
let StripAnsi = require('strip-ansi')
let moment = require('moment')
let path = require('path')
let Phenotypes = require('./phenotype.js')
let argv = require('yargs').argv

let VERSION = 'Zenbot 4 Genetic Backtester v0.2.2'

let PARALLEL_LIMIT = (process.env.PARALLEL_LIMIT && +process.env.PARALLEL_LIMIT) || require('os').cpus().length

let TREND_EMA_MIN = 20
let TREND_EMA_MAX = 20

let OVERSOLD_RSI_MIN = 20
let OVERSOLD_RSI_MAX = 35

let OVERSOLD_RSI_PERIODS_MIN = 15
let OVERSOLD_RSI_PERIODS_MAX = 25

let NEUTRAL_RATE_MIN = 10
let NEUTRAL_RATE_MAX = 10

let NEUTRAL_RATE_AUTO = false

let iterationCount = 0

let selectedStrategies 
let pools = {}
let simArgs
let populationSize = 0
let generationCount = 0
let generationProcessing = false

function  runCommand  (taskStrategyName, phenotype, cb) {
  var cmdArgs = Object.assign({}, phenotype)
  cmdArgs.strategy = taskStrategyName
  Object.assign(cmdArgs, simArgs)

  var selector = cmdArgs.selector
  delete cmdArgs.selector
  delete cmdArgs.sim

  let zenbot_cmd = process.platform === 'win32' ? 'zenbot.bat' : './zenbot.sh'
  let command = `${zenbot_cmd} sim ${selector}`

  for (const [ key, value ] of Object.entries(cmdArgs)) {
    command += ` --${key}=${value}`
  }

  console.log(`[ ${iterationCount++}/${populationSize * selectedStrategies.length} ] ${command}`)

  phenotype['sim'] = {}


  shell.exec(command, {
    silent: true,
    async: true
  }, (code, stdout, stderr) => {
    if (code) {
      console.error(command)
      console.error(stderr)
      return cb(null, null)
    }

    let result = null
    try {
      result = processOutput(stdout,taskStrategyName,phenotype)
      phenotype['sim'] = result
      result['fitness'] = Phenotypes.fitness(phenotype)
    } catch (err) {
      console.log('Bad output detected', err.toString())
      console.log(stdout)
    }

    cb(null, result)
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
  let wlMatch
  let errMatch
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
    wlMatch = (simulationResults.simresults.total_sells - simulationResults.simresults.total_losses) +'/'+ simulationResults.simresults.total_losses
    wins          = simulationResults.simresults.total_sells - simulationResults.simresults.total_losses
    losses        = simulationResults.simresults.total_losses
    errorRate     = simulationResults.simresults.total_losses / simulationResults.simresults.total_sells
    days = parseInt(simulationResults.days)
    start = parseInt(simulationResults.start)
    end = parseInt(simulationResults.end || null)
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
    r.start = moment(start).format('YYYYMMDDhhmm')
  }
  if (end) {
    r.end = moment(end).format('YYYYMMDDhhmm')
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
    vwap_max: RangeFactor(0, 10000, 10) //0 disables this max cap. Test in increments of 10
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
  fs.writeFileSync(csvFileName, dataCSV, err => {
    if (err) throw err
    console.log('> Finished writing generation csv to ' + csvFileName)
  //  callback(1)
  })
  fs.writeFileSync(jsonFileName, dataJSON, err => {
    if (err) throw err
    console.log('> Finished writing generation json to ' + jsonFileName)
  //  callback(2)
  })
}



function simulateGeneration  () {
  generationProcessing = true
  console.log(`\n\n=== Simulating generation ${++generationCount} ===\n`)

  let days = argv.days
  if (!days) {
    if (argv.start) {
      var start = moment(argv.start, 'YYYYMMDDhhmm')
      days = Math.max(1, moment().diff(start, 'days'))
    }
    else {
      var end = moment(argv.end, 'YYYYMMDDhhmm')
      days = moment().diff(end, 'days') + 1
    }
  }
  if (generationCount == 0)
    runUpdate(days, argv.selector)

  iterationCount = 1
  let tasks = selectedStrategies.map(v => pools[v]['pool'].population().map(phenotype => {
    return cb => {
      phenotype.backtester_generation = iterationCount
      phenotype.exchangeMarketPair = argv.selector
      runCommand(v, phenotype, cb)
    }
  })).reduce((a, b) => a.concat(b))

  parallel(tasks, PARALLEL_LIMIT, (err, results) => {
    console.log('\nGeneration complete, saving results...')
    results = results.filter(function(r) {
      return !!r
    })

    results.sort((a, b) => (a.fitness < b.fitness) ? 1 : ((b.fitness < a.fitness) ? -1 : 0))

    let fieldsGeneral = ['selector.normalized', 'fitness', 'vsBuyHold', 'wlRatio', 'frequency', 'strategy', 'order_type', 'endBalance', 'buyHold', 'wins', 'losses', 'period_length', 'min_periods', 'days', 'params']
    let fieldNamesGeneral = ['Selector', 'Fitness', 'VS Buy Hold (%)', 'Win/Loss Ratio', '# Trades/Day', 'Strategy', 'Order Type', 'Ending Balance ($)', 'Buy Hold ($)', '# Wins', '# Losses', 'Period', 'Min Periods', '# Days', 'Full Parameters']

    let dataCSV = json2csv({
      data: results,
      fields: fieldsGeneral,
      fieldNames: fieldNamesGeneral
    })

    let fileDate = Math.round(+new Date() / 1000)
    let csvFileName = `simulations/backtesting_${fileDate}.csv`

    let poolData = {}
    selectedStrategies.forEach(function(v) {
      poolData[v] = pools[v]['pool'].population()
    })

    let jsonFileName = `simulations/generation_data_${fileDate}_gen_${generationCount}.json`
    let dataJSON = JSON.stringify(poolData, null, 2)

    //Display best of the generation
    console.log('\n\nGeneration\'s Best Results')
    let bestOverallResult = []
    let prefix = './zenbot.sh sim '
    selectedStrategies.forEach((v)=> {
      let best = pools[v]['pool'].best()
      let bestCommand 
      if(best.sim){
        console.log(`\t(${best.sim.strategy}) Sim Fitness ${best.sim.fitness}, VS Buy and Hold: ${best.sim.vsBuyHold} End Balance: ${best.sim.endBalance}, Wins/Losses ${best.sim.wins}/${best.sim.losses}, ROI ${best.sim.roi}.`)
        bestCommand = generateCommandParams(best.sim)
        bestOverallResult.push(best.sim)
      } else {
        console.log(`\t(${results[0].strategy}) Result Fitness ${results[0].fitness}, VS Buy and Hold: ${results[0].vsBuyHold}, End Balance: ${results[0].endBalance}, Wins/Losses ${results[0].wins}/${results[0].losses}.`)
        bestCommand = generateCommandParams(results[0])
        bestOverallResult.push(results[0])
      }

      // prepare command snippet from top result for this strat

      bestCommand = prefix + bestCommand
      bestCommand = bestCommand + ' --asset_capital=' + argv.asset_capital + ' --currency_capital=' + argv.currency_capital
      console.log(bestCommand + '\n')
    })

    bestOverallResult.sort((a, b) => (a.fitness < b.fitness) ? 1 : ((b.fitness < a.fitness) ? -1 : 0))
    if (selectedStrategies.length > 1){
      console.log(`\t(${bestOverallResult[0].strategy}) Best Overall Fitness ${bestOverallResult[0].fitness}, VS Buy and Hold: ${bestOverallResult[0].vsBuyHold} End Balance: ${bestOverallResult[0].endBalance}, Wins/Losses ${bestOverallResult[0].wins}/${bestOverallResult[0].losses}, ROI ${bestOverallResult[0].roi}.`)
    }
    let bestOverallCommand = generateCommandParams(bestOverallResult[0])
    bestOverallCommand = prefix + bestOverallCommand
    bestOverallCommand = bestOverallCommand + ' --asset_capital=' + argv.asset_capital + ' --currency_capital=' + argv.currency_capital
    if (selectedStrategies.length > 1) {
      console.log(bestOverallCommand + '\n')
    }

    saveGenerationData(csvFileName, jsonFileName, dataCSV, dataJSON )

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
delete simArgs.use_strategies
delete simArgs.population_data
delete simArgs.population
delete simArgs['$0'] // This comes in to argv all by itself
delete simArgs['_']  // This comes in to argv all by itself

let strategyName = (argv.use_strategies) ? argv.use_strategies : 'all'
let populationFileName = (argv.population_data) ? argv.population_data : null
populationSize = (argv.population) ? argv.population : 100

console.log(`Backtesting strategy ${strategyName} ...`)
console.log(`Creating population of ${populationSize} ...\n`)

 
selectedStrategies = (strategyName === 'all') ? allStrategyNames() : strategyName.split(',')


let importedPoolData = (populationFileName) ? JSON.parse(fs.readFileSync(populationFileName, 'utf8')) : null

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
  let population = (importedPoolData && importedPoolData[v]) ? importedPoolData[v] : []
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


setInterval( ()=>{
  if (generationProcessing == false)  simulateGeneration()
},1000)