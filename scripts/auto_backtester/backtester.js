#!/usr/bin/env node

/* Zenbot 4.04 Backtester v0.2
 * Ali Anari <ali@anari.io>
 * 05/30/2017
 *
 * Usage: Pass in the same parameters as you would to "zenbot sim", EXCEPT for:
 * EMA Parameters: "trend_ema", "neutral_rate"
 * RSI Parameters: "oversold_rsi", "oversold_rsi_periods"
 *
 * Example: ./backtester.js gdax.ETH-USD --days=10 --currency_capital=5
*/

let shell     = require('shelljs');
let parallel  = require('run-parallel-limit');
let json2csv  = require('json2csv');
let roundp    = require('round-precision');
let fs        = require('fs');
let StripAnsi = require('strip-ansi');

let VERSION = 'Zenbot 4.04 Backtester v0.2';

let PARALLEL_LIMIT = require('os').cpus().length;

let TREND_EMA_MIN = 20;
let TREND_EMA_MAX = 20;

let OVERSOLD_RSI_MIN = 20;
let OVERSOLD_RSI_MAX = 35;

let OVERSOLD_RSI_PERIODS_MIN = 15;
let OVERSOLD_RSI_PERIODS_MAX = 25;

let NEUTRAL_RATE_MIN = 10;
let NEUTRAL_RATE_MAX = 10;

let NEUTRAL_RATE_AUTO = false

let countArr = [];

let range = (start, end, step) => {
  if (!step) step = 1;
  var r = [];
  for (i=start; i<=end; i+=step) {
    r = r.concat(i);
  }
  return r;
};

let product = args => {
  if(!args.length)
    return [[]];
  var prod = product(args.slice(1)), r = [];
  args[0].forEach(function(x) {
    prod.forEach(function(p) {
      r.push([x].concat(p));
    });
  });
  return r;
};

let objectProduct = obj => {
  var keys = Object.keys(obj),
    values = keys.map(function(x) { return obj[x] });

  return product(values).map(function(p) {
    var e = {};
    keys.forEach(function(k, n) { e[k] = p[n] });
    return e;
  });
};

let runCommand = (strategy, cb) => {
  countArr.push(1);
  let strategyArgs = {
    cci_srsi: `--cci_periods=${strategy.rsi_periods} --rsi_periods=${strategy.srsi_periods} --srsi_periods=${strategy.srsi_periods} --srsi_k=${strategy.srsi_k} --srsi_d=${strategy.srsi_d} --oversold_rsi=${strategy.oversold_rsi} --overbought_rsi=${strategy.overbought_rsi} --oversold_cci=${strategy.oversold_cci} --overbought_cci=${strategy.overbought_cci} --constant=${strategy.constant}`,
    srsi_macd: `--rsi_periods=${strategy.rsi_periods} --srsi_periods=${strategy.srsi_periods} --srsi_k=${strategy.srsi_k} --srsi_d=${strategy.srsi_d} --oversold_rsi=${strategy.oversold_rsi} --overbought_rsi=${strategy.overbought_rsi} --ema_short_period=${strategy.ema_short_period} --ema_long_period=${strategy.ema_long_period} --signal_period=${strategy.signal_period} --up_trend_threshold=${strategy.up_trend_threshold} --down_trend_threshold=${strategy.down_trend_threshold}`,
    macd: `--ema_short_period=${strategy.ema_short_period} --ema_long_period=${strategy.ema_long_period} --signal_period=${strategy.signal_period} --up_trend_threshold=${strategy.up_trend_threshold} --down_trend_threshold=${strategy.down_trend_threshold} --overbought_rsi_periods=${strategy.overbought_rsi_periods} --overbought_rsi=${strategy.overbought_rsi}`,
    rsi: `--rsi_periods=${strategy.rsi_periods} --oversold_rsi=${strategy.oversold_rsi} --overbought_rsi=${strategy.overbought_rsi} --rsi_recover=${strategy.rsi_recover} --rsi_drop=${strategy.rsi_drop} --rsi_divisor=${strategy.rsi_divisor}`,
    sar: `--sar_af=${strategy.sar_af} --sar_max_af=${strategy.sar_max_af}`,
    speed: `--baseline_periods=${strategy.baseline_periods} --trigger_factor=${strategy.trigger_factor}`,
    trend_ema: `--trend_ema=${strategy.trend_ema} --oversold_rsi=${strategy.oversold_rsi} --oversold_rsi_periods=${strategy.oversold_rsi_periods} --neutral_rate=${strategy.neutral_rate}`
  };
  let zenbot_cmd = process.platform === 'win32' ? 'zenbot.bat' : './zenbot.sh'; // Use 'win32' for 64 bit windows too
  let command = `${zenbot_cmd} sim ${simArgs} ${strategyArgs[strategyName]} --period=${strategy.period}  --min_periods=${strategy.min_periods}`;
  console.log(`[ ${countArr.length}/${strategies[strategyName].length} ] ${command}`);

  shell.exec(command, {silent:true, async:true}, (code, stdout, stderr) => {
    if (code) {
      console.error(command)
      console.error(stderr)
      return cb(null, null)
    }
    cb(null, processOutput(stdout));
  });
};

let processOutput = output => {
  let jsonRegexp    = /(\{[\s\S]*?\})\send balance/g;
  let endBalRegexp  = /end balance: (\d+\.\d+) \(/g;
  let buyHoldRegexp  = /buy hold: (\d+\.\d+) \(/g;
  let vsBuyHoldRegexp  = /vs. buy hold: (-?\d+\.\d+)%/g;
  let wlRegexp      = /win\/loss: (\d+)\/(\d+)/g;
  let errRegexp     = /error rate: (.*)%/g;

  let strippedOutput = StripAnsi(output);
  let output2 = strippedOutput.substr(strippedOutput.length - 3500);

  let rawParams     = jsonRegexp.exec(output2)[1];
  let params        = JSON.parse(rawParams);
  let endBalance    = endBalRegexp.exec(output2)[1];
  let buyHold       = buyHoldRegexp.exec(output2)[1];
  let vsBuyHold     = vsBuyHoldRegexp.exec(output2)[1];
  let wlMatch       = wlRegexp.exec(output2);
  let errMatch      = errRegexp.exec(output2);
  let wins          = wlMatch !== null ? parseInt(wlMatch[1]) : 0;
  let losses        = wlMatch !== null ? parseInt(wlMatch[2]) : 0;
  let errorRate     = errMatch !== null ? parseInt(errMatch[1]) : 0;
  let days          = parseInt(params.days);

  let roi = roundp(
    ((endBalance - params.currency_capital) / params.currency_capital) * 100,
    3
  );

  return {
    params:             rawParams.replace(/[\r\n]/g, ''),
    endBalance:         parseFloat(endBalance),
    buyHold:            parseFloat(buyHold),
    vsBuyHold:          parseFloat(vsBuyHold),
    wins:               wins,
    losses:             losses,
    errorRate:          parseFloat(errorRate),

    // cci_srsi
    cciPeriods:         params.cci_periods,
    rsiPeriods:         params.rsi_periods,
    srsiPeriods:        params.srsi_periods,
    srsiK:              params.srsi_k,
    srsiD:              params.srsi_d,
    oversoldRsi:        params.oversold_rsi,
    overboughtRsi:      params.overbought_rsi,
    oversoldCci:        params.oversold_cci,
    overboughtCci:      params.overbought_cci,
    constant:           params.consant,

    // srsi_macd
    rsiPeriods:         params.rsi_periods,
    srsiPeriods:        params.srsi_periods,
    srsiK:              params.srsi_k,
    srsiD:              params.srsi_d,
    oversoldRsi:        params.oversold_rsi,
    overboughtRsi:      params.overbought_rsi,
    emaShortPeriod:     params.ema_short_period,
    emaLongPeriod:      params.ema_long_period,
    signalPeriod:       params.signal_period,
    upTrendThreshold:   params.up_trend_threshold,
    downTrendThreshold: params.down_trend_threshold,

    // macd
    emaShortPeriod:     params.ema_short_period,
    emaLongPeriod:      params.ema_long_period,
    signalPeriod:       params.signal_period,
    upTrendThreshold:   params.up_trend_threshold,
    downTrendThreshold: params.down_trend_threshold,
    overboughtRsiPeriods: params.overbought_rsi_periods,
    overboughtRsi:      params.overbought_rsi,

    // rsi
    rsiPeriods:         params.rsi_periods,
    oversoldRsi:        params.oversold_rsi,
    overboughtRsi:      params.overbought_rsi,
    rsiRecover:         params.rsi_recover,
    rsiDrop:            params.rsi_drop,
    rsiDivsor:          params.rsi_divisor,

    // sar
    sarAf:              params.sar_af,
    sarMaxAf:           params.sar_max_af,

    // speed
    baselinePeriods:   params.baseline_periods,
    triggerFactor:     params.trigger_factor,

    // trend_ema
    trendEma:           params.trend_ema,
    neutralRate:        params.neutral_rate,
    oversoldRsiPeriods: params.oversold_rsi_periods,
    oversoldRsi:        params.oversold_rsi,

    days:               days,
    period:             params.period,
    min_periods:        params.min_periods,
    roi:                roi,
    wlRatio:            losses > 0 ? roundp(wins / losses, 3) : 'Infinity',
    frequency:          roundp((wins + losses) / days, 3)
  };
};

let strategies = {
  cci_srsi: objectProduct({
    period: ['20m'],
    min_periods: [52, 200],
    rsi_periods: [14, 20],
    srsi_periods: [14, 20],
    srsi_k: [3, 9],
    srsi_d: [3, 9],
    oversold_rsi: [22],
    overbought_rsi: [85],
    oversold_cci: [-90],
    overbought_cci: [140],
    constant: [0.015]
  }),
  srsi_macd: objectProduct({
    period: ['30m'],
    min_periods: [52, 200],
    rsi_periods: [14, 20],
    srsi_periods: [14, 20],
    srsi_k: [3, 9],
    srsi_d: [3, 9],
    oversold_rsi: [18],
    overbought_rsi: [82],
    ema_short_period: [12, 24],
    ema_long_period: [26, 200],
    signal_period: [9, 14],
    up_trend_threshold: [0],
    down_trend_threshold: [0]
  }),
  macd: objectProduct({
    period: ['1h'],
    min_periods: [52],
    ema_short_period: range(10, 15),
    ema_long_period: range(20, 30),
    signal_period: range(9, 9),
    up_trend_threshold: range(0, 0),
    down_trend_threshold: range(0, 0),
    overbought_rsi_periods: range(15, 25),
    overbought_rsi: range(70, 70)
  }),
  rsi: objectProduct({
    period: ['2m'],
    min_periods: [52],
    rsi_periods: range(10, 30),
    oversold_rsi: range(20, 35),
    overbought_rsi: range(82, 82),
    rsi_recover: range(3, 3),
    rsi_drop: range(0, 0),
    rsi_divisor: range(2, 2)
  }),
  sar: objectProduct({
    period: ['2m'],
    min_periods: [52],
    sar_af: range(0.01, 0.055, 0.005),
    sar_max_af: range(0.1, 0.55, 0.05)
  }),
  speed: objectProduct({
    period: ['1m'],
    min_periods: [52],
    baseline_periods: range(1000, 5000, 200),
    trigger_factor: range(1.0, 2.0, 0.1)
  }),
  trend_ema: objectProduct({
    period: ['2m'],
    min_periods: [52],
    trend_ema: range(TREND_EMA_MIN, TREND_EMA_MAX),
    neutral_rate: (NEUTRAL_RATE_AUTO ? new Array('auto') : []).concat(range(NEUTRAL_RATE_MIN, NEUTRAL_RATE_MAX).map(r => r / 100)),
    oversold_rsi_periods: range(OVERSOLD_RSI_PERIODS_MIN, OVERSOLD_RSI_PERIODS_MAX),
    oversold_rsi: range(OVERSOLD_RSI_MIN, OVERSOLD_RSI_MAX)
  })
};

let args = process.argv;
args.shift();
args.shift();
let simArgs = args.join(' ');
let strategyName = 'trend_ema';
if (args.indexOf('--strategy') !== -1) {
  strategyName = args[args.indexOf('--strategy') + 1];
}

let tasks = strategies[strategyName].map(strategy => {
  return cb => {
    runCommand(strategy, cb)
  }
});

console.log(`\n--==${VERSION}==--`);
console.log(new Date().toUTCString());
console.log(`\nBacktesting [${strategies[strategyName].length}] iterations for strategy ${strategyName}...\n`);

parallel(tasks, PARALLEL_LIMIT, (err, results) => {
  console.log("\nBacktesting complete, saving results...");
  results = results.filter(function (r) {
    return !!r
  })
  results.sort((a,b) => (a.roi < b.roi) ? 1 : ((b.roi < a.roi) ? -1 : 0));
  let fileName = `backtesting_${Math.round(+new Date()/1000)}.csv`;
  let filedsGeneral = ['roi', 'vsBuyHold', 'errorRate', 'wlRatio', 'frequency', 'endBalance', 'buyHold', 'wins', 'losses', 'period', 'min_periods', 'days'];
  let filedNamesGeneral = ['ROI (%)', 'VS Buy Hold (%)', 'Error Rate (%)', 'Win/Loss Ratio', '# Trades/Day', 'Ending Balance ($)', 'Buy Hold ($)', '# Wins', '# Losses', 'Period', 'Min Periods', '# Days'];
  let fields = {
    cci_srsi: filedsGeneral.concat(['cciPeriods', 'rsiPeriods', 'srsiPeriods', 'srsiK', 'srsiD', 'oversoldRsi', 'overboughtRsi', 'oversoldCci', 'overboughtCci', 'Constant', 'params']),
    srsi_macd: filedsGeneral.concat(['rsiPeriods', 'srsiPeriods', 'srsiK', 'srsiD', 'oversoldRsi', 'overboughtRsi', 'emaShortPeriod', 'emaLongPeriod', 'signalPeriod', 'upTrendThreshold', 'downTrendThreshold', 'params']),
    macd: filedsGeneral.concat([ 'emaShortPeriod', 'emaLongPeriod', 'signalPeriod', 'upTrendThreshold', 'downTrendThreshold', 'overboughtRsiPeriods', 'overboughtRsi', 'params']),
    rsi: filedsGeneral.concat(['rsiPeriods', 'oversoldRsi', 'overboughtRsi', 'rsiRecover', 'rsiDrop', 'rsiDivsor', 'params']),
    sar: filedsGeneral.concat(['sarAf', 'sarMaxAf', 'params']),
    speed: filedsGeneral.concat(['baselinePeriods', 'triggerFactor', 'params']),
    trend_ema: filedsGeneral.concat(['trendEma', 'neutralRate', 'oversoldRsiPeriods', 'oversoldRsi', 'params'])
  };
  let fieldNames = {
    cci_srsi: filedNamesGeneral.concat(['CCI Periods', 'RSI Periods', 'SRSI Periods', 'SRSI K', 'SRSI D', 'Oversold RSI', 'Overbought RSI', 'Oversold CCI', 'Overbought CCI', 'Constant', 'Full Parameters']),
    srsi_macd: filedNamesGeneral.concat(['RSI Periods', 'SRSI Periods', 'SRSI K', 'SRSI D', 'Oversold RSI', 'Overbought RSI', 'EMA Short Period', 'EMA Long Period', 'Signal Period', 'Up Trend Threshold', 'Down Trend Threshold', 'Full Parameters']),
    macd: filedNamesGeneral.concat(['EMA Short Period', 'EMA Long Period', 'Signal Period', 'Up Trend Threshold', 'Down Trend Threshold', 'Overbought Rsi Periods', 'Overbought Rsi', 'Full Parameters']),
    rsi: filedNamesGeneral.concat(['RSI Periods', 'Oversold RSI', 'Overbought RSI', 'RSI Recover', 'RSI Drop', 'RSI Divisor', 'Full Parameters']),
    sar: filedNamesGeneral.concat(['SAR AF', 'SAR MAX AF', 'Full Parameters']),
    speed: filedNamesGeneral.concat(['Baseline Periods', 'Trigger Factor', 'Full Parameters']),
    trend_ema: filedNamesGeneral.concat(['Trend EMA', 'Neutral Rate', 'Oversold RSI Periods', 'Oversold RSI', 'Full Parameters'])
  };
  let csv = json2csv({
    data: results,
    fields: fields[strategyName],
    fieldNames: fieldNames[strategyName]
  });

  fs.writeFile(fileName, csv, err => {
    if (err) throw err;
    console.log(`\nResults successfully saved to ${fileName}!\n`);
  });
});
