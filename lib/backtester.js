let _ = require('lodash')
  , moment = require('moment')
  , argv = require('yargs').argv
  , tb = require('timebucket')
  , readline = require('readline')
  , z = require('zero-fill')
  , n = require('numbro')
  , shell = require('shelljs')
  , StripAnsi = require('strip-ansi')
  , path = require('path')
  , fs = require('fs')
  , roundp = require('round-precision')
  , Phenotypes = require('./phenotype')


const spawn = require('child_process').spawn

let simArgs, simTotalCount, parallelLimit, writeFile

let processOutput = function (output, taskStrategyName, pheno) {
  let selector = pheno.selector || pheno.exchangeMarketPair
  let tFileName = path.resolve(__dirname, '..', 'simulations', 'sim_' + taskStrategyName.replace('_', '') + '_' + selector.toLowerCase().replace('_', '') + '_' + pheno.backtester_generation + '.json')
  let simulationResults

  let outputArray
  let params
  let assetPriceLastBuy
  let lastAssestValue
  let assetCapital
  let profit
  let startCapital
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
  if (fs.existsSync(tFileName)) {
    let jsonBuffer
    jsonBuffer = fs.readFileSync(tFileName, { encoding: 'utf8' })
    simulationResults = JSON.parse(jsonBuffer)
    fs.unlinkSync(tFileName)
  }

  // If somehow the sim file failed to write, this will most often recover it by parsing the last output
  if (typeof (simulationResults) !== 'object') {
    // Find everything between the first { and last }
    outputArray = output.split('{')
    outputArray.shift()
    output = outputArray.join('{')

    outputArray = output.split('}')
    outputArray.pop()
    output = outputArray.join('}')

    simulationResults = JSON.parse(`{${output}}`)
  }

  if (typeof (simulationResults) === 'object' && typeof simulationResults.simresults !== typeof undefined) {
    params = simulationResults
    endBalance = simulationResults.simresults.currency
    assetPriceLastBuy = simulationResults.simresults.last_buy_price
    lastAssestValue = simulationResults.simresults.last_assest_value
    assetCapital = simulationResults.simresults.asset_capital
    startCapital = simulationResults.simresults.start_capital
    profit = simulationResults.simresults.profit


    buyHold = simulationResults.simresults.buy_hold
    vsBuyHold = simulationResults.simresults.vs_buy_hold
    //wlMatch = (simulationResults.simresults.total_sells - simulationResults.simresults.total_losses) +'/'+ simulationResults.simresults.total_losses
    wins = simulationResults.simresults.total_sells - simulationResults.simresults.total_losses
    losses = simulationResults.simresults.total_losses
    errorRate = simulationResults.simresults.total_losses / simulationResults.simresults.total_sells
    days = parseInt(simulationResults.days)
    start = parseInt(simulationResults.start)
    end = parseInt(simulationResults.end || null)
  }
  else {
    console.log(`Couldn't find simulationResults for ${pheno.backtester_generation}`)
    console.log(pheno.command.commandString)
    // this should return a general bad result but not throw an error
    // our job here is to use the result.  not diagnose an error at this point so a failing sim should just be ignored.
    // idea here is to make the fitness of this calculation as bad as possible so darwin won't use the combonation of parameters again.
    // todo:  make the result its own object, and in this function just set the values don't define the result here.
    return {
      params: 'module.exports = {}',
      endBalance: 0,
      buyHold: 0,
      vsBuyHold: 0,
      lastAssestValue: 0,
      assetPriceLastBuy:0,
      wins: 0,
      losses: -1,
      errorRate: 100,
      days: 0,
      period_length: 0,
      min_periods: 0,
      markdown_buy_pct: 0,
      markup_sell_pct: 0,
      order_type: 'maker',
      wlRatio: 'Infinity',
      roi: -1000,
      selector: selector,
      strategy: taskStrategyName,
      frequency: 0,
      assetCapital:0,
      startCapital:0,
      profit:0

    }
  }

  if (typeof params === 'undefined') {
    console.log('busted params')
    console.log(`output: ${JSON.stringify(output)}`)
    console.log(`simulationResults: ${JSON.stringify(simulationResults)}`)
  }

  let roi
  if (params.currency_capital == 0.0) {
    roi = roundp(endBalance, 3)
  }
  else {
    roi = roundp(((endBalance - params.currency_capital) / params.currency_capital) * 100, 3)
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
  delete r.silent
  delete r.generateLaunch
  delete r.ignoreLaunchFitness
  delete r.maxCores
  delete r.minTrades
  delete r.noStatSave
  delete r.filename
  //delete r.fitnessCalcType
   
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
  if (!days) {
    days = parseInt(argv.days, 10)
  }
  if (!days || days < 1) days = 1

  let results = {
    params: 'module.exports = ' + JSON.stringify(r),
    assetPriceLastBuy: assetPriceLastBuy,
    lastAssestValue: lastAssestValue,
    profit: profit,
    assetCapital: assetCapital,
    startCapital: startCapital,
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

let runUpdate = function (days, selector) {
  let zenbot_cmd = process.platform === 'win32' ? 'zenbot.bat' : './zenbot.sh'
  let command = `${zenbot_cmd} backfill --days=${days} ${selector}`
  console.log('Backfilling (might take some time) ...')
  console.log(command)

  shell.exec(command, {
    silent: true,
    async: false
  })
}

let ensureDirectoryExistence = function (filePath) {
  var dirname = path.dirname(filePath)
  if (fs.existsSync(dirname)) {
    return true
  }
  ensureDirectoryExistence(dirname)
  fs.mkdirSync(dirname)
}

let monitor = {
  periodDurations: [],
  phenotypes: [],

  distanceOfTimeInWords: (timeA, timeB) => {
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
  },

  actualRange: function (so) {
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
      var actualStart = moment(tb(so.start.valueOf()).resize(so.period_length).subtract(so.min_periods + 2).toMilliseconds())
      return {
        start: actualStart,
        end: so.end
      }
    }

    return { start: so.start, end: so.end }
  },

  reportStatus: function () {
    var genCompleted = 0
    // var genTotal = 0

    var simsDone = 0
    var simsActive = 0
    var simsErrored = 0
    var simsAll = simTotalCount
    var simsRemaining = simsAll
    // var self = this
    // console.log(`simsAll: ${simsAll}, this.phenotypes: ${this.phenotypes.length}`);

    readline.clearLine(process.stdout)
    readline.cursorTo(process.stdout, 0)

    var inProgress = []
    var inProgressStr = []

    var slowestP = null
    var slowestEta = null

    var bestP = null
    var bestBalance = null

    this.phenotypes.forEach(function (p) {
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

    var homeStretchMode = simsActive < (parallelLimit - 1) && simsRemaining == 0

    inProgress.forEach(function (p) {
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
        var percentage = Math.min(progress / totalTime, 1)
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
          inProgressStr.push(`${(c.iteration + ':').gray} ${(percentage * 100).toFixed(1)}% ETA: ${monitor.distanceOfTimeInWords(eta, now)}`)
        else
          inProgressStr.push(`${(c.iteration + ':').gray} ${(percentage * 100).toFixed(1)}%`)
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


    var percentage = ((simsDone + genCompleted) / simsAll * 100).toFixed(1)
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
        process.stdout.write(`, Slowest(${slowestP.command.iteration.toString().yellow}) ETA: ${monitor.distanceOfTimeInWords(slowestEta, moment()).yellow}`)
    }
  },

  reset: function () {
    this.phenotypes.length = 0
  },

  start: function () {
    process.stdout.write('\n\n')
    this.generationStarted = moment()

    this.reportInterval = setInterval(() => {
      this.reportStatus()
    }, 1000)
  },

  stop: function (label) {
    this.generationEnded = moment()
    clearInterval(this.reportInterval)
    var timeStr = this.distanceOfTimeInWords(this.generationEnded, this.generationStarted)
    console.log(`\n\n${label} completed at ${this.generationEnded.format('YYYY-MM-DD HH:mm:ss')}, took ${timeStr}, results saved to:`)
  }
}

module.exports = {

  init: function (options) {
    simArgs = options.simArgs
    simTotalCount = options.simTotalCount
    parallelLimit = options.parallelLimit
    writeFile = options.writeFile
  },

  deLint: function () {
    //Clean up any generation files left over in the simulation directory
    //they will be overwritten, but best not to confuse the issue.
    //if it fails.   doesn't matter they will be overwritten anyways. not need to halt the system.
    try {
      let tDirName = path.resolve(__dirname, '..', 'simulations')
      let tFileName = 'sim_'
      let files = fs.readdirSync(tDirName)

      for (let i = 0; i < files.length; i++) {
        if (files[i].lastIndexOf(tFileName) == 0) {
          let filePath = path.resolve(__dirname, '..', 'simulations', files[i])
          fs.unlinkSync(filePath)
        }

      }
    } catch (err) {
      console.log('error deleting lint from prior run')
    }
  },

  writeFileAndFolder: function (filePath, data) {
    ensureDirectoryExistence(filePath)
    fs.writeFileSync(filePath, data)
  },

  ensureBackfill: function () {
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
    runUpdate(days, argv.selector)
  },

  buildCommand: function (taskStrategyName, phenotype, filename) {
    var cmdArgs = Object.assign({}, phenotype)
    cmdArgs.strategy = taskStrategyName
    Object.assign(cmdArgs, simArgs)

    var selector = cmdArgs.selector
    delete cmdArgs.selector
    delete cmdArgs.exchangeMarketPair
    delete cmdArgs.sim
    delete cmdArgs.command
    delete cmdArgs.help
    delete cmdArgs.version

    if (argv.include_html)
      cmdArgs.filename = filename

    if (argv.silent)
      cmdArgs.silent = true

    cmdArgs.backtester_generation = phenotype.backtester_generation

    let zenbot_cmd = process.platform === 'win32' ? 'zenbot.bat' : './zenbot.sh'
    let command = `${zenbot_cmd} sim ${selector}`

    for (const [key, value] of Object.entries(cmdArgs)) {
      if (_.isBoolean(value)) {
        command += ` --${value ? '' : 'no-'}${key}`
      } else {
        command += ` --${key}=${value}`
      }
    }

    var actualRange = monitor.actualRange({
      start: cmdArgs.start, end: cmdArgs.end, days: cmdArgs.days,
      period_length: cmdArgs.period_length, min_periods: (cmdArgs.min_periods || 1)
    })

    return {
      commandString: command,
      queryStart: actualRange.start,
      queryEnd: actualRange.end
    }
  },

  runCommand: (taskStrategyName, phenotype, command, cb) => {
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
        result = processOutput(stdout, taskStrategyName, phenotype)

        command.endTime = moment()
        command.result = result

        writeFile(command.iteration, JSON.stringify(command))

        phenotype['sim'] = result
        result['fitness'] = Phenotypes.fitness(phenotype)

        monitor.reportStatus()

      } catch (err) {
        console.log(`Bad output detected on sim ${command.iteration} while running:`)
        console.log(command.commandString)
        console.log(err.toString())
        console.log(stdout)
        console.log(err.stack)
      }

      cb(null, result)
    })
    proc.stdout.on('data', (data) => {
      if (data.length > 500) {
        endData = data
        // console.log(`${command.iteration}: ${data}`)
      }
      else {
        var str = StripAnsi(data.toString()), lines = str.split(/(\r?\n)/g)
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i]
          // console.log(`${command.iteration}: ${line}`)
          if (line.indexOf('-') == 4 && line.indexOf(':') == 13) {
            var timeStr = line.slice(0, 20)
            command.currentTimeString = timeStr
            // console.log(`${command.iteration}: ${command.currentTimeString}`)
          }
        }

      }
    })
  },

  startMonitor: () => monitor.start(),
  stopMonitor: (label) => monitor.stop(label),
  resetMonitor: () => monitor.reset(),
  reportStatus: () => monitor.reportStatus(),
  trackPhenotype: function (phenotype) {
    monitor.phenotypes.push(phenotype)
  }

}
