#!/usr/bin/env node

/* Zenbot 4 Auto Backtester v2.0
 * glennfu
 *
 * Usage: Pass in the same parameters as you would to "zenbot sim", EXCEPT for:
 * 2 parameters you want to be backtested
 *
 * Imagine you've just run:
 *
 *    ./scripts/genetic_backtester/darwin.js --days=1 --asset_capital=0 --currency_capital=500 --selector="binance.EOS-BTC" --population=20 --use_strategies=trend_ema
 *
 * and got the following result:
 *
 *    ./zenbot.sh sim binance.EOS-BTC --avg_slippage_pct=0.045 --buy_stop_pct=40 --markdown_buy_pct=0.37804270974174603 --markup_sell_pct=4.088646046027306 --max_buy_loss_pct=25 --max_sell_loss_pct=25 --max_slippage_pct=5 --min_periods=7 --neutral_rate=auto --order_poll_time=5000 --order_type=maker --oversold_rsi=78 --oversold_rsi_periods=15 --period=73m --period_length=73m --profit_stop_enable_pct=2 --profit_stop_pct=5 --rsi_periods=15 --sell_stop_pct=0 --strategy=trend_ema --trend_ema=4 --start=201802251900 --asset_capital=0 --currency_capital=500
 *
 * which performs like:
 *     end balance: 500.34778000 (0.06%)
 *     buy hold: 500.98047787 (0.19%)
 *     vs. buy hold: -0.13%
 *     2 trades over 3 days (avg 0.66 trades/day)
 *     win/loss: 1/0
 *     error rate: 0.00%
 *
 * To use the Auto Backtester, simply remove one or two parameters that are in strategies/trend_ema/strategy.js's phenotype definition.
 * Let's remove `order_type` and `oversold_rsi`
 *
 *    ./zenbot.sh sim binance.EOS-BTC --avg_slippage_pct=0.045 --buy_stop_pct=40 --markdown_buy_pct=0.37804270974174603 --markup_sell_pct=4.088646046027306 --max_buy_loss_pct=25 --max_sell_loss_pct=25 --max_slippage_pct=5 --min_periods=7 --neutral_rate=auto --order_poll_time=5000 --oversold_rsi_periods=15 --period=73m --period_length=73m --profit_stop_enable_pct=2 --profit_stop_pct=5 --rsi_periods=15 --sell_stop_pct=0 --strategy=trend_ema --trend_ema=4 --start=201802251900 --asset_capital=0 --currency_capital=500
 *
 * Now pass this to backtester.js and add a step_size, like 10, and re-add days=1 from darwin
 *
 *    ./scripts/auto_backtester/backtester.js --step_size=10 --days=1 --selector=binance.EOS-BTC --avg_slippage_pct=0.045 --buy_stop_pct=40 --markdown_buy_pct=0.37804270974174603 --markup_sell_pct=4.088646046027306 --max_buy_loss_pct=25 --max_sell_loss_pct=25 --max_slippage_pct=5 --min_periods=7 --neutral_rate=auto --order_poll_time=5000 --oversold_rsi_periods=15 --period=73m --period_length=73m --profit_stop_enable_pct=2 --profit_stop_pct=5 --rsi_periods=15 --sell_stop_pct=0 --strategy=trend_ema --trend_ema=4 --start=201802251900 --asset_capital=0 --currency_capital=500
 *
 * See output:
 *
 *   Auto Backtest of order_type and oversold_rsi completed at 2018-02-27 15:43:28, took 0m 7s, results saved to:
 *   simulations/auto_backtest_201802271543/results_auto_backtest_201802271543.csv
 *
 *
 *   Best Result had order_type=taker and oversold_rsi=73
 *   (trend_ema) Result Fitness 0.006083518953845421, VS Buy and Hold:   0.3% BuyAndHold Balance: 500.980477  End Balance: 502.504339, Wins/Losses 1/0, ROI 0.000000.
 *   ./zenbot.sh sim binance.EOS-BTC --period_length=73m --min_periods=7 --markdown_buy_pct=0.37804270974174603 --markup_sell_pct=4.088646046027306 --order_type=taker --sell_stop_pct=0 --buy_stop_pct=40 --profit_stop_enable_pct=2 --profit_stop_pct=5 --trend_ema=4 --oversold_rsi_periods=15 --oversold_rsi=73 --backtester_generation=16 --strategy=trend_ema --days=1 --avg_slippage_pct=0.045 --max_buy_loss_pct=25 --max_sell_loss_pct=25 --max_slippage_pct=5 --neutral_rate=auto --order_poll_time=5000 --rsi_periods=15 --start=201802251900 --asset_capital=0 --currency_capital=500
 *
 * So you can see our vsBuyHold has gone from -0.13% to 0.30%, an improvement!
*/

let Phenotypes = require('../../lib/phenotype')
  , Backtester = require('../../lib/backtester')
  , argv = require('yargs').argv
  , moment = require('moment')
  , path = require('path')
  , parallel = require('run-parallel-limit')
  , colors = require('colors')
  , z = require('zero-fill')
  , n = require('numbro')
  , _ = require('underscore')
  , json2csv = require('json2csv')

let PARALLEL_LIMIT = (process.env.PARALLEL_LIMIT && +process.env.PARALLEL_LIMIT) || require('os').cpus().length

simArgs = Object.assign({}, argv)
if (simArgs.period)
  simArgs.period_length = simArgs.period
delete simArgs.period
delete simArgs['$0'] // This comes in to argv all by itself
delete simArgs['_']  // This comes in to argv all by itself

let debug = simArgs.debug
delete simArgs.debug

if (simArgs.maxCores) {
  if (simArgs.maxCores < 1)
    PARALLEL_LIMIT = 1
  else
    PARALLEL_LIMIT = simArgs.maxCores

  delete simArgs.maxCores
}

let population_data = `auto_backtest_${moment().format('YYYYMMDDHHmm')}`
let iterationCount = 0

if (simArgs.help || !simArgs.selector || !simArgs.step_size || simArgs.step_size < 2) {
  console.log('--strategy=<stragegy_name> only one strategy')
  console.log('--step_size=<int>    number of sims for each parameter, minimum 2')
  console.log('--maxCores=<int>    maximum processes to execute at a time default is # of cpu cores in system')
  console.log('--selector=<exchange.marketPair>  ')
  console.log('--asset_capital=<float>    amount coin to start sim with ')
  console.log('--currency_capital=<float>  amount of capital/base currency to start sim with'),
  console.log('--days=<int>  amount of days to use when backfilling')
  console.log('--sort_results  add if you want results.csv sorted by fitness')
  process.exit(0)
}

var timeCount = 0
if (simArgs.days) timeCount++
if (simArgs.start) timeCount++
if (simArgs.end) timeCount++

if (timeCount < 2) {
  console.log('need at least 2 of: days, start, end')
  process.exit(1)
}

function runAutoBacktester () {

  let strategyName = simArgs.strategy
  let strategyData = require(path.resolve(__dirname, `../../extensions/strategies/${strategyName}/strategy`))
  let strategyPhenotypes = strategyData.phenotypes
  if (!strategyPhenotypes) {
    console.log(`No phenotypes definition found for strategy ${strategyName}`)
    process.exit(1)
  }

  var pData = Object.assign({}, strategyPhenotypes)
  var unsetKeys = []
  Object.keys(strategyPhenotypes).forEach(function (key) {
    if (key in simArgs) {
      pData[key] = simArgs[key]
    }
    else {
      unsetKeys.push(key)
    }
  })

  if (unsetKeys.length > 2) {
    console.log(`You omitted values for keys: ${unsetKeys.join(', ')}. You can have at most 2 unset keys`)
    process.exit(1)
  }
  else if (unsetKeys.length <= 0) {
    console.log(`You must omit at least one key in ${strategyName}'s phenotype for backtesting`)
    process.exit(1)
  }

  console.log(`\n\n=== Running Auto Backtester on ${unsetKeys.join(' and ').blue} ===\n`)

  Backtester.resetMonitor()
  Backtester.ensureBackfill()

  let step_size = simArgs.step_size
  delete simArgs.step_size

  let phenotypes = []

  let step_size_1 = step_size
    , step_size_2 = step_size
    , key1 = unsetKeys[0]
    , key2 = unsetKeys[1]
    , p1 = strategyPhenotypes[key1]
    , p2 = strategyPhenotypes[key2]

  // If you're iterating through a set, do the whole set regardless of step_size
  if (p1 && p1.type === 'listOption')
    step_size_1 = p1.options.length
  if (p2 && p2.type === 'listOption')
    step_size_2 = p2.options.length

  // If we have 2 keys, build all combinations of both, otherwise just loop through the 1 key values
  if (unsetKeys.length == 2) {
    for (let i = 0; i < step_size_1; i++) {
      for (let j = 0; j < step_size_2; j++) {
        var phenotype = Object.assign({}, pData)
        phenotype[key1] = Phenotypes.range(p1, i, step_size_1)
        phenotype[key2] = Phenotypes.range(p2, j, step_size_2)
        phenotypes.push(phenotype)
      }
    }
  }
  else {
    for (let i = 0; i < step_size_1; i++) {
      var phenotype = Object.assign({}, pData)
      phenotype[key1] = Phenotypes.range(p1, i, step_size_1)
      phenotypes.push(phenotype)
    }
  }

  if (debug)
    console.log(`Running options:`)

  // Remove duplicates in case something is screwy in combination with step_size higher than the number of options.
  // No sense in re-running the same thing multiple times
  phenotypes = _.uniq(phenotypes, function(p, key, a) {
    if (debug)
      console.log(`${key1}: ${p[key1]}, ${key2}: ${p[key2]}`) // print all combinations of options
    return JSON.stringify(p);
  });

  Backtester.init({
    simArgs: simArgs,
    simTotalCount: phenotypes.length,
    parallelLimit: PARALLEL_LIMIT,
    writeFile: writeSimDataFile
  })

  let tasks = phenotypes.map(phenotype => {

    return cb => {
      phenotype.backtester_generation = iterationCount
      phenotype.selector = argv.selector
      Backtester.trackPhenotype(phenotype)

      var command = Backtester.buildCommand(strategyName, phenotype, `simulations/${population_data}/sim_${iterationCount}_result.html`)
      command.iteration = iterationCount
      writeSimDataFile(iterationCount, JSON.stringify(command))

      iterationCount++
      Backtester.runCommand(strategyName, phenotype, command, cb)
    }
  })

  Backtester.startMonitor()

  parallel(tasks, PARALLEL_LIMIT, (err, results) => {
    Backtester.stopMonitor(`Auto Backtest of ${unsetKeys.join(' and ').blue}`)

    results = results.filter(function(r) {
      return !!r
    })

    if (argv.sort_results)
      results.sort((a, b) => (Number(a.fitness) < Number(b.fitness)) ? 1 : ((Number(b.fitness) < Number(a.fitness)) ? -1 : 0))

    // console.log(`results(${results.length}): ${JSON.stringify(results)}`)

    results.forEach(function(result) {
      let it = result.params.match(/backtester_generation\":(\d+),/)
      let phenotype = phenotypes[parseInt(it[1], 10)]
      result.commandString = phenotype.command.commandString

      unsetKeys.forEach(function(key) {
        result[key] = phenotype[key]
      })
      // console.log(`it: ${JSON.stringify(it)}`)
    })

    let fieldsGeneral = unsetKeys.slice(0)
    let fieldNamesGeneral = unsetKeys.slice(0)

    fieldsGeneral = fieldsGeneral.concat(['selector', 'fitness', 'vsBuyHold', 'wlRatio', 'frequency', 'strategy', 'order_type', 'endBalance', 'buyHold', 'wins', 'losses', 'period_length', 'min_periods', 'days', 'commandString'])
    fieldNamesGeneral = fieldNamesGeneral.concat(['Selector', 'Fitness', 'VS Buy Hold (%)', 'Win/Loss Ratio', '# Trades/Day', 'Strategy', 'Order Type', 'Ending Balance ($)', 'Buy Hold ($)', '# Wins', '# Losses', 'Period', 'Min Periods', '# Days', 'Command'])

    let dataCSV = json2csv({
      data: results,
      fields: fieldsGeneral,
      fieldNames: fieldNamesGeneral
    })
    let csvFileName = `simulations/${population_data}/results_${population_data}.csv` // MS Word whines about opening multiple files of the same name
    console.log(csvFileName)
    Backtester.writeFileAndFolder(csvFileName, dataCSV)


    // If we didn't sort them before, definitely sort them now to get the best one
    if (!argv.sort_results)
      results.sort((a, b) => (Number(a.fitness) < Number(b.fitness)) ? 1 : ((Number(b.fitness) < Number(a.fitness)) ? -1 : 0))
    let best = results[0]

    // Display best of the generation
    let best_string = []
    unsetKeys.forEach(function(key) {
      best_string.push(`${key}=${best[key]}`)
    })
    console.log(`\n\nBest Result had ${best_string.join(' and ').green}`)

    console.log(`(${best.strategy}) Result Fitness ${best.fitness}, VS Buy and Hold: ${z(5, (n(best.vsBuyHold).format('0.0') + '%'), ' ').yellow} BuyAndHold Balance: ${z(5, (n(best.buyHold).format('0.000000')), ' ').yellow}  End Balance: ${z(5, (n(best.endBalance).format('0.000000')), ' ').yellow}, Wins/Losses ${best.wins}/${best.losses}, ROI ${z(5, (n(results.roi).format('0.000000') ), ' ').yellow}.`)
    console.log(best.commandString + '\n')
  })

}

let writeSimDataFile = (iteration, data) => {
  let jsonFileName = `simulations/${population_data}/sim_${iteration}.json`
  Backtester.writeFileAndFolder(jsonFileName, data)
}


Backtester.deLint()
runAutoBacktester()


