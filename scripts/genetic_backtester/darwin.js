#!/usr/bin/env node

/* Zenbot 4 Genetic Backtester
 * Clifford Roche <clifford.roche@gmail.com>
 * 07/01/2017
 *
 * Example: ./darwin.js --selector="bitfinex.ETH-USD" --days="10" --currency_capital="5000" --use_strategies="all | macd,trend_ema,etc" --population="101" --population_data="simulations/generation_data_NUMBERS"
 * Params:
 * --use_strategies=<stragegy_name>,<stragegy_name>,<stragegy_name>   Min one strategy, can include more than one
 * --population_data=<filename>           filename used for continueing backtesting from previous run
 * --generateLaunch=<true>|<false>        will generate .sh and .bat file using the best generation discovered
 * --ignoreLaunchFitness=<true>|<false>   if used with --generateLaunch it will always write a new launch file regardless if latest fitness is greater
 * --floatScanWindow                      Time window used for analyzing data be adjusted every generation
 * --population=<int>                     populate per strategy
 * --maxCores=<int>                       maximum processes to execute at a time default is # of cpu cores in system
 * --selector=<exchange.marketPair>
 * --asset_capital=<float>                amount coin to start sim with
 * --currency_capital=<float>             amount of capital/base currency to start sim with
 * --days=<int>                           amount of days to use when backfilling
 * --noStatSave=<true>|<false>            true:no statistics are saved to the simulation folder
 * --silent=<true>|<false>                true:can improve performance
 * --runGenerations=<int>                 if used run this number of generations, will be shown 1 less due to generations starts at 0
 *
 *
 * any parameters for sim and or strategy can be passed in and will override the genetic test generated parameter
 * i.e. if --period_length=1m is passed all test will be performed using --period_length=1m instead of trying to find that parameter
 *
 */

let parallel = require('run-parallel-limit')
let json2csv = require('json2csv')
let fs = require('fs')
let GeneticAlgorithmCtor = require('geneticalgorithm')
let moment = require('moment')
let path = require('path')
// eslint-disable-next-line no-unused-vars
let colors = require('colors')
let Phenotypes = require('../../lib/phenotype')
let Backtester = require('../../lib/backtester')
let argv = require('yargs').argv
let z = require('zero-fill')
let n = require('numbro')
let _ = require('lodash')

let VERSION = 'Zenbot 4 Genetic Backtester v0.2.3'

let PARALLEL_LIMIT = (process.env.PARALLEL_LIMIT && +process.env.PARALLEL_LIMIT) || require('os').cpus().length

let iterationCount = 0

let selectedStrategies
let pools = {}
let simArgs
let populationSize = 0
let generationCount = 1
let runGenerations = undefined
let generationProcessing = false
let population_data = ''
let noStatSave = false
let floatScanWindow = false
let ignoreLaunchFitness = false

let readSimDataFile = (iteration) => {
  let jsonFileName = `simulations/${population_data}/gen_${generationCount}/sim_${iteration}.json`

  if (fs.existsSync(jsonFileName)) {
    let simData = JSON.parse(fs.readFileSync(jsonFileName, { encoding: 'utf8' }))
    return simData
  }
  else {
    return null
  }
}

let writeSimDataFile = (iteration, data) => {
  let jsonFileName = `simulations/${population_data}/gen_${generationCount}/sim_${iteration}.json`
  Backtester.writeFileAndFolder(jsonFileName, data)
}

function allStrategyNames() {
  let pathName = path.resolve(__dirname, '..', '..', 'extensions', 'strategies')
  return fs.readdirSync(pathName).filter(function (file) {
    return fs.statSync(pathName + '/' + file).isDirectory()
  })
}

function isUsefulKey(key) {
  if (key == 'filename' || key == 'show_options' || key == 'sim') return false
  return true
}

function generateCommandParams(input) {
  if (!isUndefined(input) && !isUndefined(input.params)) {
    input = input.params.replace('module.exports =', '')
  }

  input = JSON.parse(input)

  var result = ''
  var keys = Object.keys(input)
  for (let i = 0; i < keys.length; i++) {
    var key = keys[i]
    if (isUsefulKey(key)) {
      // selector should be at start before keys
      if (key == 'selector') {
        result = input[key] + result
      }

      else result += ' --' + key + '=' + input[key]
    }
  }
  return result
}

function saveGenerationData(csvFileName, jsonFileName, dataCSV, dataJSON) {
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

// Find the first incomplete generation of this session, where incomplete means no "results" files
while (fs.existsSync(`simulations/${population_data}/gen_${generationCount}`)) {
  generationCount++
}
generationCount--

if (generationCount > 0 && !fs.existsSync(`simulations/${population_data}/gen_${generationCount}/results.csv`)) {
  generationCount--
}

function saveLaunchFiles(saveLauchFile, configuration) {
  if (!saveLauchFile) return
  //let lConfiguration = configuration.replace(' sim ', ' trade ')
  let lFilenameNix = new String().concat('./gen.', configuration.selector.toLowerCase(), '.sh')
  let lFinenamewin32 = new String().concat('./gen.', configuration.selector.toLowerCase(), '.bat')
  delete configuration.generateLaunch
  delete configuration.backtester_generation

  let bestOverallCommand = generateCommandParams(configuration)
  let lastFitnessLevel = -9999.0

  // get prior fitness level nix
  if (fs.existsSync(lFilenameNix)) {
    let lFileCont = fs.readFileSync(lFilenameNix, { encoding: 'utf8', flag: 'r' })
    let lines = lFileCont.split('\n')
    if (lines.length > 2)
      if (lines[1].includes('fitness=')) {
        let th = lines[1].split('=')
        lastFitnessLevel = th[1]
      }
  }

  // get prior firness level win32
  if (fs.existsSync(lFinenamewin32)) {
    let lFileCont = fs.readFileSync(lFinenamewin32, { encoding: 'utf8', flag: 'r' })
    let lines = lFileCont.split('\n')
    if (lines.length > 1)
      if (lines[1].includes('fitness=')) {
        let th = lines[1].split('=')
        lastFitnessLevel = th[1]
      }
  }

  //write Nix Version
  let lNixContents = '#!/bin/bash\n'.concat('#fitness=', configuration.fitness, '\n',
    'env node zenbot.js trade ',
    bestOverallCommand, ' $@\n')

  let lWin32Contents = '@echo off\n'.concat('rem fitness=', configuration.fitness, '\n',
    'node zenbot.js trade ',
    bestOverallCommand, ' %*\n')

  if (((Number(configuration.fitness) > Number(lastFitnessLevel)) || (ignoreLaunchFitness)) && Number(configuration.fitness) > 0.0) {
    fs.writeFileSync(lFilenameNix, lNixContents)
    fs.writeFileSync(lFinenamewin32, lWin32Contents)
    // using the string instead of octet as eslint compaines about an invalid number if the number starts with 0
    fs.chmodSync(lFilenameNix, '777')
    fs.chmodSync(lFinenamewin32, '777')
  }
}

let cycleCount = -1

function isUndefined(variable) {
  return typeof variable === typeof undefined
}

function simulateGeneration(generateLaunchFile) {
  generationProcessing = true

  // Find the first incomplete generation of this session, where incomplete means no "results" files
  while (fs.existsSync(`simulations/${population_data}/gen_${generationCount}`)) {
    generationCount++
  }

  generationCount--

  if (generationCount > 0 && !fs.existsSync(`simulations/${population_data}/gen_${generationCount}/results.csv`)) {
    generationCount--
  }

  if (noStatSave) {
    cycleCount++
    generationCount = cycleCount
  }

  let ofGenerations = (!isUndefined(runGenerations)) ? `of ${runGenerations}` : ''

  console.log(`\n\n=== Simulating generation ${++generationCount} ${ofGenerations} ===\n`)
  Backtester.resetMonitor()
  Backtester.ensureBackfill()

  iterationCount = 0

  let tasks = selectedStrategies.map(v => pools[v]['pool'].population().map(phenotype => {
    return cb => {
      phenotype.backtester_generation = iterationCount
      phenotype.exchangeMarketPair = argv.selector
      Backtester.trackPhenotype(phenotype)

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
        command = Backtester.buildCommand(v, phenotype, `simulations/${population_data}/gen_${generationCount}/sim_${iterationCount}_result.html`)
        command.iteration = iterationCount
        writeSimDataFile(iterationCount, JSON.stringify(command))
      }

      iterationCount++
      Backtester.runCommand(v, phenotype, command, cb)
    }
  })).reduce((a, b) => a.concat(b))

  Backtester.startMonitor()

  parallel(tasks, PARALLEL_LIMIT, (err, results) => {
    Backtester.stopMonitor(`Generation ${generationCount}`)

    results = results.filter(function (r) {
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
    selectedStrategies.forEach(function (v) {
      poolData[v] = pools[v]['pool'].population()
    })

    let jsonFileName = `simulations/${population_data}/gen_${generationCount}/results.json`
    let dataJSON = JSON.stringify(poolData, null, 2)
    if (!noStatSave)
      saveGenerationData(csvFileName, jsonFileName, dataCSV, dataJSON)

    //Display best of the generation
    console.log('\n\nGeneration\'s Best Results')
    let bestOverallResult = []
    let prefix = './zenbot.sh sim '
    selectedStrategies.forEach((v) => {
      let best = pools[v]['pool'].best()
      let bestCommand

      if (best.sim) {
        console.log(`(${best.sim.strategy}) Sim Fitness ${best.sim.fitness}, VS Buy and Hold: ${z(5, (n(best.sim.vsBuyHold).format('0.0') + '%'), ' ').yellow} BuyAndHold Balance: ${z(5, (n(best.sim.buyHold).format('0.000000')), ' ').yellow}  End Balance: ${z(5, (n(best.sim.endBalance).format('0.000000')), ' ').yellow}, Wins/Losses ${best.sim.wins}/${best.sim.losses}, ROI ${z(5, (n(best.sim.roi).format('0.000000')), ' ').yellow}.`)
        bestCommand = generateCommandParams(best.sim)
        bestOverallResult.push(best.sim)
      } else {
        console.log(`(${results[0].strategy}) Result Fitness ${results[0].fitness}, VS Buy and Hold: ${z(5, (n(results[0].vsBuyHold).format('0.0') + '%'), ' ').yellow} BuyAndHold Balance: ${z(5, (n(results[0].buyHold).format('0.000000')), ' ').yellow}  End Balance: ${z(5, (n(results[0].endBalance).format('0.000000')), ' ').yellow}, Wins/Losses ${results[0].wins}/${results[0].losses}, ROI ${z(5, (n(results.roi).format('0.000000')), ' ').yellow}.`)
        bestCommand = generateCommandParams(results[0])
        bestOverallResult.push(results[0])
      }

      // prepare command snippet from top result for this strat
      if (bestCommand != '') {
        bestCommand = prefix + bestCommand
        bestCommand = bestCommand + ' --asset_capital=' + argv.asset_capital + ' --currency_capital=' + argv.currency_capital
        console.log(bestCommand + '\n')
      }
    })

    bestOverallResult.sort((a, b) =>
      (isUndefined(a.fitness)) ? 1 :
        (isUndefined(b.fitness)) ? 0 :
          (a.fitness < b.fitness) ? 1 :
            (b.fitness < a.fitness) ? -1 : 0)

    let bestOverallCommand = generateCommandParams(bestOverallResult[0])
    bestOverallCommand = prefix + bestOverallCommand
    bestOverallCommand = bestOverallCommand + ' --asset_capital=' + argv.asset_capital + ' --currency_capital=' + argv.currency_capital

    saveLaunchFiles(generateLaunchFile, bestOverallResult[0])

    if (selectedStrategies.length > 1) {
      console.log(`(${bestOverallResult[0].strategy}) Best Overall Fitness ${bestOverallResult[0].fitness}, VS Buy and Hold: ${z(5, (n(bestOverallResult[0].vsBuyHold).format('0.00') + '%'), ' ').yellow} BuyAndHold Balance: ${z(5, (n(bestOverallResult[0].buyHold).format('0.000000')), ' ').yellow}  End Balance: ${z(5, (n(bestOverallResult[0].endBalance).format('0.000000')), ' ').yellow}, Wins/Losses ${bestOverallResult[0].wins}/${bestOverallResult[0].losses}, ROI ${z(5, (n(bestOverallResult[0].roi).format('0.000000')), ' ').yellow}.`)
    }

    selectedStrategies.forEach((v) => {
      pools[v]['pool'] = pools[v]['pool'].evolve()
    })

    if (!isUndefined(runGenerations) && runGenerations <= generationCount) {
      process.exit()
    }

    generationProcessing = false
  })
}

console.log(`\n--==${VERSION}==--`)
console.log(new Date().toUTCString() + '\n')

simArgs = Object.assign({}, argv)
if (!simArgs.selector) {
  simArgs.selector = 'bitfinex.ETH-USD'
}

if (!simArgs.filename) {
  simArgs.filename = 'none'
}

if (simArgs.help || !(simArgs.use_strategies)) {
  console.log('--use_strategies=<stragegy_name>,<stragegy_name>,<stragegy_name>   Min one strategy, can include more than one')
  console.log('--population_data=<filename>    filename used for continueing backtesting from previous run')
  console.log('--generateLaunch=<true>|<false>        will generate .sh and .bat file using the best generation discovered')
  console.log('--population=<int>    populate per strategy')
  console.log('--maxCores=<int>    maximum processes to execute at a time default is # of cpu cores in system')
  console.log('--selector=<exchange.marketPair>  ')
  console.log('--asset_capital=<float>    amount coin to start sim with ')
  console.log('--currency_capital=<float>  amount of capital/base currency to start sim with')
  console.log('--days=<int>  amount of days to use when backfilling')
  console.log('--noStatSave=<true>|<false>')
  console.log('--runGenerations=<int>  if used run this number of generations, will be shown 1 less due to generations starts at 0')
  process.exit(0)
}

delete simArgs.use_strategies
delete simArgs.population_data
delete simArgs.population
delete simArgs['$0'] // This comes in to argv all by itself
delete simArgs['_']  // This comes in to argv all by itself

if (simArgs.maxCores) {
  if (simArgs.maxCores < 1) PARALLEL_LIMIT = 1
  else PARALLEL_LIMIT = simArgs.maxCores
}

if (!isUndefined(simArgs.runGenerations)) {
  if (simArgs.runGenerations) {
    runGenerations = simArgs.runGenerations - 1
  }
}

let generateLaunchFile = (simArgs.generateLaunch) ? true : false
noStatSave = (simArgs.noStatSave) ? true : false

let strategyName = (argv.use_strategies) ? argv.use_strategies : 'all'
populationSize = (argv.population) ? argv.population : 100
floatScanWindow = (argv.floatScanWindow) ? argv.floatScanWindow : false
ignoreLaunchFitness = (argv.ignoreLaunchFitness) ? argv.ignoreLaunchFitness : false

population_data = argv.population_data || `backtest.${simArgs.selector.toLowerCase()}.${moment().format('YYYYMMDDHHmmss')}`

console.log(`Backtesting strategy ${strategyName} ...\n`)
console.log(`Creating population of ${populationSize} ...\n`)

selectedStrategies = (strategyName === 'all') ? allStrategyNames() : strategyName.split(',')

Backtester.deLint()

for (var i = 0; i < selectedStrategies.length; i++) {
  let v = selectedStrategies[i]
  let strategyPool = pools[v] = {}
  let strategyData = require(path.resolve(__dirname, `../../extensions/strategies/${v}/strategy`))
  let strategyPhenotypes = strategyData.phenotypes

  if (strategyPhenotypes) {
    let evolve = true
    let population = []

    for (var i2 = population.length; i2 < populationSize; ++i2) {
      population.push(Phenotypes.create(strategyPhenotypes))
      evolve = false
    }

    strategyPool['config'] = {
      mutationFunction: function (phenotype) {
        return Phenotypes.mutation(phenotype, strategyPhenotypes)
      },
      crossoverFunction: function (phenotypeA, phenotypeB) {
        return Phenotypes.crossover(phenotypeA, phenotypeB, strategyPhenotypes)
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
  else {
    if (strategyName === 'all') {
      // skip it, probably just something like forex_analytics
      selectedStrategies.splice(i, 1)
      i--
    }
    else {
      console.log(`No phenotypes definition found for strategy ${v}`)
      process.exit(1)
    }
  }
}

// BEGIN - exitHandler
var exitHandler = function (options, exitErr) {
  if (generationCount && options.cleanup && (isUndefined(runGenerations) || runGenerations !== generationCount)) {
    console.log('Resume this backtest later with:')
    var darwin_args = process.argv.slice(2, process.argv.length)

    var hasPopData = false
    var popDataArg = `--population_data=${population_data}`
    darwin_args.forEach(function (arg) {
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

process.on('exit', exitHandler.bind(null, { cleanup: true }))

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }))

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }))
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }))

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }))
// END - exitHandler

Backtester.init({
  simArgs: simArgs,
  simTotalCount: populationSize * selectedStrategies.length,
  parallelLimit: PARALLEL_LIMIT,
  writeFile: writeSimDataFile
})
setInterval(() => {
  if (generationProcessing == false) simulateGeneration(generateLaunchFile)
}, 1000)
