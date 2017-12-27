#!/usr/bin/env node

/* Zenbot 4 Genetic Backtester
 * Clifford Roche <clifford.roche@gmail.com>
 * 07/01/2017
 *
 * Example: ./darwin.js --selector="bitfinex.ETH-USD" --days=10 --currency_capital=5000 --use_strategies=(all|macd,trend_ema)
 */

let shell = require('shelljs');
let parallel = require('run-parallel-limit');
let json2csv = require('json2csv');
let roundp = require('round-precision');
let fs = require('fs');
let GeneticAlgorithmCtor = require('geneticalgorithm');
let StripAnsi = require('strip-ansi');
let moment = require('moment');

let Phenotypes = require('./phenotype.js');

let VERSION = 'Zenbot 4 Genetic Backtester v0.2';

let PARALLEL_LIMIT = (process.env.PARALLEL_LIMIT && +process.env.PARALLEL_LIMIT) || require('os').cpus().length;

let TREND_EMA_MIN = 20;
let TREND_EMA_MAX = 20;

let OVERSOLD_RSI_MIN = 20;
let OVERSOLD_RSI_MAX = 35;

let OVERSOLD_RSI_PERIODS_MIN = 15;
let OVERSOLD_RSI_PERIODS_MAX = 25;

let NEUTRAL_RATE_MIN = 10;
let NEUTRAL_RATE_MAX = 10;

let NEUTRAL_RATE_AUTO = false;

let iterationCount = 0;

let runCommand = (taskStrategyName, phenotype, cb) => {
  let commonArgs = `--strategy=${taskStrategyName} --periodLength=${phenotype.periodLength} --min_periods=${phenotype.min_periods} --markup_pct=${phenotype.markup_pct} --order_type=${phenotype.order_type} --sell_stop_pct=${phenotype.sell_stop_pct} --buy_stop_pct=${phenotype.buy_stop_pct} --profit_stop_enable_pct=${phenotype.profit_stop_enable_pct} --profit_stop_pct=${phenotype.profit_stop_pct}`;
  let strategyArgs = {
    crossover_vwap: `--emalen1=${phenotype.emalen1}  --vwap_length=${phenotype.vwap_length} --vwap_max=${phenotype.vwap_max} --markdown_buy_pct=${phenotype.markdown_buy_pct} --markup_sell_pct=${phenotype.markup_sell_pct}`,
    trendline: `--lastpoints=${phenotype.lastpoints}  --avgpoints=${phenotype.avgpoints} --lastpoints2=${phenotype.lastpoints2} --avgpoints2=${phenotype.avgpoints2} --markdown_buy_pct=${phenotype.markdown_buy_pct} --markup_sell_pct=${phenotype.markup_sell_pct}`,
    cci_srsi: `--cci_periods=${phenotype.rsi_periods} --rsi_periods=${phenotype.srsi_periods} --srsi_periods=${phenotype.srsi_periods} --srsi_k=${phenotype.srsi_k} --srsi_d=${phenotype.srsi_d} --oversold_rsi=${phenotype.oversold_rsi} --overbought_rsi=${phenotype.overbought_rsi} --oversold_cci=${phenotype.oversold_cci} --overbought_cci=${phenotype.overbought_cci} --constant=${phenotype.constant}`,
    srsi_macd: `--rsi_periods=${phenotype.rsi_periods} --srsi_periods=${phenotype.srsi_periods} --srsi_k=${phenotype.srsi_k} --srsi_d=${phenotype.srsi_d} --oversold_rsi=${phenotype.oversold_rsi} --overbought_rsi=${phenotype.overbought_rsi} --ema_short_period=${phenotype.ema_short_period} --ema_long_period=${phenotype.ema_long_period} --signal_period=${phenotype.signal_period} --up_trend_threshold=${phenotype.up_trend_threshold} --down_trend_threshold=${phenotype.down_trend_threshold}`,
    macd: `--ema_short_period=${phenotype.ema_short_period} --ema_long_period=${phenotype.ema_long_period} --signal_period=${phenotype.signal_period} --up_trend_threshold=${phenotype.up_trend_threshold} --down_trend_threshold=${phenotype.down_trend_threshold} --overbought_rsi_periods=${phenotype.overbought_rsi_periods} --overbought_rsi=${phenotype.overbought_rsi}`,
    neural: `--activation_1_type=${phenotype.activation_1_type} --neurons_1=${phenotype.neurons_1} --depth=${phenotype.depth} --momentum=${phenotype.momentum} --decay=${phenotype.decay} --min_predict=${phenotype.min_predict} --learns=${phenotype.learns}`,
    rsi: `--rsi_periods=${phenotype.rsi_periods} --oversold_rsi=${phenotype.oversold_rsi} --overbought_rsi=${phenotype.overbought_rsi} --rsi_recover=${phenotype.rsi_recover} --rsi_drop=${phenotype.rsi_drop} --rsi_divisor=${phenotype.rsi_divisor}`,
    sar: `--sar_af=${phenotype.sar_af} --sar_max_af=${phenotype.sar_max_af}`,
    speed: `--baseline_periods=${phenotype.baseline_periods} --trigger_factor=${phenotype.trigger_factor}`,
    trend_ema: `--trend_ema=${phenotype.trend_ema} --oversold_rsi=${phenotype.oversold_rsi} --oversold_rsi_periods=${phenotype.oversold_rsi_periods} --neutral_rate=auto`,
    trust_distrust: `--sell_threshold=${phenotype.sell_threshold} --sell_threshold_max=${phenotype.sell_threshold_max} --sell_min=${phenotype.sell_min} --buy_threshold=${phenotype.buy_threshold} --buy_threshold_max=${phenotype.buy_threshold_max} --greed=${phenotype.greed}`,
    ta_macd: `--ema_short_period=${phenotype.ema_short_period} --ema_long_period=${phenotype.ema_long_period} --signal_period=${phenotype.signal_period} --up_trend_threshold=${phenotype.up_trend_threshold} --down_trend_threshold=${phenotype.down_trend_threshold} --overbought_rsi_periods=${phenotype.overbought_rsi_periods} --overbought_rsi=${phenotype.overbought_rsi}`,
    ta_ema: `--trend_ema=${phenotype.trend_ema} --oversold_rsi=${phenotype.oversold_rsi} --oversold_rsi_periods=${phenotype.oversold_rsi_periods} --neutral_rate=auto`
  };
  let zenbot_cmd = process.platform === 'win32' ? 'zenbot.bat' : './zenbot.sh';
  let command = `${zenbot_cmd} sim ${simArgs} ${commonArgs} ${strategyArgs[taskStrategyName]}`;
  console.log(`[ ${iterationCount++}/${populationSize * selectedStrategies.length} ] ${command}`);

  phenotype['sim'] = {};

  shell.exec(command, {
    silent: true,
    async: true
  }, (code, stdout, stderr) => {
    if (code) {
      console.error(command);
      console.error(stderr);
      return cb(null, null);
    }

    let result = null;
    try {
      result = processOutput(stdout);
      phenotype['sim'] = result;
      result['fitness'] = Phenotypes.fitness(phenotype);
    } catch (err) {
      console.log(`Bad output detected`, err.toString());
      console.log(stdout);
    }

    cb(null, result);
  });
};

let runUpdate = (days, selector) => {
  let zenbot_cmd = process.platform === 'win32' ? 'zenbot.bat' : './zenbot.sh';
  let command = `${zenbot_cmd} backfill --days=${days} ${selector}`;
  console.log(`Backfilling (might take some time) ...`);
  console.log(command);

  shell.exec(command, {
    silent: true,
    async: false
  });
};

let processOutput = output => {
  let jsonRegexp = /(\{[\s\S]*?\})\send balance/g;
  let endBalRegexp = /end balance: (\d+\.\d+) \(/g;
  let buyHoldRegexp = /buy hold: (\d+\.\d+) \(/g;
  let vsBuyHoldRegexp = /vs. buy hold: (-?\d+\.\d+)%/g;
  let wlRegexp = /win\/loss: (\d+)\/(\d+)/g;
  let errRegexp = /error rate: (.*)%/g;

  let strippedOutput = StripAnsi(output);
  let output2 = strippedOutput.substr(strippedOutput.length - 3500);

  let rawParams = jsonRegexp.exec(output2)[1];
  let params = JSON.parse(rawParams);
  let endBalance = endBalRegexp.exec(output2)[1];
  let buyHold = buyHoldRegexp.exec(output2)[1];
  let vsBuyHold = vsBuyHoldRegexp.exec(output2)[1];
  let wlMatch = wlRegexp.exec(output2);
  let errMatch      = errRegexp.exec(output2);
  let wins          = wlMatch !== null ? parseInt(wlMatch[1]) : 0;
  let losses        = wlMatch !== null ? parseInt(wlMatch[2]) : 0;
  let errorRate     = errMatch !== null ? parseInt(errMatch[1]) : 0;
  let days = parseInt(params.days);

  let roi = roundp(
    ((endBalance - params.currency_capital) / params.currency_capital) * 100,
    3
  );

  let r = JSON.parse(rawParams.replace(/[\r\n]/g, ''));
  delete r.asset_capital;
  delete r.buy_pct;
  delete r.currency_capital;
  delete r.days;
  delete r.mode;
  delete r.order_adjust_time;
  delete r.population;
  delete r.population_data;
  delete r.sell_pct;
  delete r.start;
  delete r.stats;
  delete r.use_strategies;
  delete r.verbose;

  return {
    params: 'module.exports = ' + JSON.stringify(r),
    endBalance: parseFloat(endBalance),
    buyHold: parseFloat(buyHold),
    vsBuyHold: parseFloat(vsBuyHold),
    wins: wins,
    losses: losses,
    errorRate: parseFloat(errorRate),
    days: days,
    periodLength: params.periodLength,
    min_periods: params.min_periods,
    markup_pct: params.markup_pct,
    order_type: params.order_type,
    roi: roi,
    wlRatio: losses > 0 ? roundp(wins / losses, 3) : 'Infinity',
    selector: params.selector,
    strategy: params.strategy,
    frequency: roundp((wins + losses) / days, 3)
  };
};

let Range = (min, max) => {
  var r = {
    type: 'int',
    min: min,
    max: max
  };
  return r;
};

let Range0 = (min, max) => {
  var r = {
    type: 'int0',
    min: min,
    max: max
  };
  return r;
};

let RangeFactor = (min, max, factor) => {
  var r = {
    type: 'intfactor',
    min: min,
    max: max,
    factor: factor
  };
  return r;
};


let RangeFloat = (min, max) => {
  var r = {
    type: 'float',
    min: min,
    max: max
  };
  return r;
};

let RangePeriod = (min, max, periodLength) => {
  var r = {
    type: 'periodLength',
    min: min,
    max: max,
    periodLength: periodLength
  };
  return r;
};

let RangeMakerTaker = () => {
  var r = {
    type: 'makertaker'
  };
  return r;
};

let RangeNeuralActivation = () => {
  var r = {
    type: 'sigmoidtanhrelu'
  };
  return r;
};

let strategies = {
  crossover_vwap: {
    // -- common
    periodLength: RangePeriod(1, 400, 'm'),
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
    vwap_length: Range(1, 300),
    vwap_max: RangeFactor(0, 10000, 10)//0 disables this max cap. Test in increments of 10
  },
  cci_srsi: {
    // -- common
    periodLength: RangePeriod(1, 120, 'm'),
    min_periods: Range(1, 200),
    markup_pct: RangeFloat(0, 5),
    order_type: RangeMakerTaker(),
    sell_stop_pct: Range0(1, 50),
    buy_stop_pct: Range0(1, 50),
    profit_stop_enable_pct: Range0(1, 20),
    profit_stop_pct: Range(1,20),

    // -- strategy
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
  srsi_macd: {
    // -- common
    periodLength: RangePeriod(1, 120, 'm'),
    min_periods: Range(1, 200),
    markup_pct: RangeFloat(0, 5),
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
  macd: {
    // -- common
    periodLength: RangePeriod(1, 120, 'm'),
    min_periods: Range(1, 200),
    markup_pct: RangeFloat(0, 5),
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
  neural: {
    // -- common
    periodLength: RangePeriod(1, 120, 'm'),
    min_periods: Range(1, 200),
    markup_pct: RangeFloat(0, 5),
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
    periodLength: RangePeriod(1, 120, 'm'),
    min_periods: Range(1, 200),
    markup_pct: RangeFloat(0, 5),
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
    periodLength: RangePeriod(1, 120, 'm'),
    min_periods: Range(2, 100),
    markup_pct: RangeFloat(0, 5),
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
    periodLength: RangePeriod(1, 120, 'm'),
    min_periods: Range(1, 100),
    markup_pct: RangeFloat(0, 5),
    order_type: RangeMakerTaker(),
    sell_stop_pct: Range0(1, 50),
    buy_stop_pct: Range0(1, 50),
    profit_stop_enable_pct: Range0(1, 20),
    profit_stop_pct: Range(1,20),

    // -- strategy
    baseline_periods: Range(1, 5000),
    trigger_factor: RangeFloat(0.1, 10)
  },
  trend_ema: {
    // -- common
    periodLength: RangePeriod(1, 120, 'm'),
    min_periods: Range(1, 100),
    markup_pct: RangeFloat(0, 5),
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
  trust_distrust: {
    // -- common
    periodLength: RangePeriod(1, 120, 'm'),
    min_periods: Range(1, 100),
    markup_pct: RangeFloat(0, 5),
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
  ta_macd: {
    // -- common
    periodLength: RangePeriod(1, 120, 'm'),
    min_periods: Range(1, 200),
    markup_pct: RangeFloat(0, 5),
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
  trendline: {
    // -- common
    periodLength: RangePeriod(1, 400, 'm'),
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
  ta_ema: {
    // -- common
    periodLength: RangePeriod(1, 120, 'm'),
    min_periods: Range(1, 100),
    markup_pct: RangeFloat(0, 5),
    order_type: RangeMakerTaker(),
    sell_stop_pct: Range0(1, 50),
    buy_stop_pct: Range0(1, 50),
    profit_stop_enable_pct: Range0(1, 20),
    profit_stop_pct: Range(1,20),

    // -- strategy
    trend_ema: Range(TREND_EMA_MIN, TREND_EMA_MAX),
    oversold_rsi_periods: Range(OVERSOLD_RSI_PERIODS_MIN, OVERSOLD_RSI_PERIODS_MAX),
    oversold_rsi: Range(OVERSOLD_RSI_MIN, OVERSOLD_RSI_MAX)
  }
};

let allStrategyNames = () => {
  let r = [];
  for (var k in strategies) {
    r.push(k);
  }
  return r;
};

console.log(`\n--==${VERSION}==--`);
console.log(new Date().toUTCString() + `\n`);

let argv = require('yargs').argv;
let simArgs = (argv.selector) ? argv.selector : 'bitfinex.ETH-USD';
if (argv.days) {
  simArgs += ` --days=${argv.days}`;
}
else {
  if (argv.start) {
    simArgs += ` --start=${argv.start}`;
  }
  if (argv.end) {
    simArgs += ` --end=${argv.end}`;
  }
}
if (argv.currency_capital) {
  simArgs += ` --currency_capital=${argv.currency_capital}`;
}
if (argv.asset_capital) {
  simArgs += ` --asset_capital=${argv.asset_capital}`;
}
if (argv.symmetrical) {
  simArgs += ` --symmetrical=true`;
}
simArgs += ` --filename none`;

let strategyName = (argv.use_strategies) ? argv.use_strategies : 'all';
let populationFileName = (argv.population_data) ? argv.population_data : null;
let populationSize = (argv.population) ? argv.population : 100;

console.log(`Backtesting strategy ${strategyName} ...`);
console.log(`Creating population of ${populationSize} ...\n`);

let pools = {};
let selectedStrategies = (strategyName === 'all') ? allStrategyNames() : strategyName.split(',');

let importedPoolData = (populationFileName) ? JSON.parse(fs.readFileSync(populationFileName, 'utf8')) : null;

selectedStrategies.forEach(function(v) {
  let strategyPool = pools[v] = {};

  let evolve = true;
  let population = (importedPoolData && importedPoolData[v]) ? importedPoolData[v] : [];
  for (var i = population.length; i < populationSize; ++i) {
    population.push(Phenotypes.create(strategies[v]));
    evolve = false;
  }

  strategyPool['config'] = {
    mutationFunction: function(phenotype) {
      return Phenotypes.mutation(phenotype, strategies[v]);
    },
    crossoverFunction: function(phenotypeA, phenotypeB) {
      return Phenotypes.crossover(phenotypeA, phenotypeB, strategies[v]);
    },
    fitnessFunction: Phenotypes.fitness,
    doesABeatBFunction: Phenotypes.competition,
    population: population,
    populationSize: populationSize
  };

  strategyPool['pool'] = GeneticAlgorithmCtor(strategyPool.config);
  if (evolve) {
    strategyPool['pool'].evolve();
  }
});

let generationCount = 1;

let simulateGeneration = () => {
  console.log(`\n\n=== Simulating generation ${generationCount++} ===\n`);

  let days = argv.days;
  if (!days) {
    if (argv.start) {
      var start = moment(argv.start, "YYYYMMDDhhmm");
      days = moment().diff(start, 'days');
    }
    else {
      var end = moment(argv.end, "YYYYMMDDhhmm");
      days = moment().diff(end, 'days') + 1;
    }
  }
  runUpdate(days, argv.selector);

  iterationCount = 1;
  let tasks = selectedStrategies.map(v => pools[v]['pool'].population().map(phenotype => {
    return cb => {
      runCommand(v, phenotype, cb);
    };
  })).reduce((a, b) => a.concat(b));

  parallel(tasks, PARALLEL_LIMIT, (err, results) => {
    console.log("\Generation complete, saving results...");
    results = results.filter(function(r) {
      return !!r;
    });

    results.sort((a, b) => (a.fitness < b.fitness) ? 1 : ((b.fitness < a.fitness) ? -1 : 0));

    let fieldsGeneral = ['selector', 'fitness', 'vsBuyHold', 'wlRatio', 'frequency', 'strategy', 'order_type', 'endBalance', 'buyHold', 'wins', 'losses', 'periodLength', 'min_periods', 'days', 'params'];
    let fieldNamesGeneral = ['Selector', 'Fitness', 'VS Buy Hold (%)', 'Win/Loss Ratio', '# Trades/Day', 'Strategy', 'Order Type', 'Ending Balance ($)', 'Buy Hold ($)', '# Wins', '# Losses', 'Period', 'Min Periods', '# Days', 'Full Parameters'];

    let csv = json2csv({
      data: results,
      fields: fieldsGeneral,
      fieldNames: fieldNamesGeneral
    });

    let fileDate = Math.round(+new Date() / 1000);
    let fileName = `simulations/backtesting_${fileDate}.csv`;
    fs.writeFile(fileName, csv, err => {
      if (err) throw err;
    });

    // let fileNameJSON = `simulations/backtesting_${fileDate}.json`;
    // fs.writeFile(fileNameJSON, JSON.stringify(results, null, 2), err => {
    //   if (err) throw err;
    // });

    let poolData = {};
    selectedStrategies.forEach(function(v) {
      poolData[v] = pools[v]['pool'].population();
    });

    let poolFileName = `simulations/generation_data_${fileDate}_gen_${generationCount}.json`;
    let poolDataJSON = JSON.stringify(poolData, null, 2);
    fs.writeFile(poolFileName, poolDataJSON, err => {
      if (err) throw err;
    });

    console.log(`\n\nGeneration's Best Results`);

    selectedStrategies.forEach(function(v) {
      let best = pools[v]['pool'].best();
      console.log(`(${v}) VS Buy and Hold: ${best.sim.vsBuyHold} End Balance: ${best.sim.endBalance}`);

      let nextGen = pools[v]['pool'].evolve();
    });

    simulateGeneration();
  });
};

simulateGeneration();
