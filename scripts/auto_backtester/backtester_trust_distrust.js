#!/usr/bin/env node

/* Zenbot 4.04 Backtester v0.2
 * Ali Anari <ali@anari.io>
 * 05/30/2017
 *
 * Usage: Pass in the same parameters as you would to "zenbot sim", EXCEPT for:
 * EMA Parameters: "trend_ema", "neutral_rate"
 * RSI Parameters: "oversold_rsi", "oversold_rsi_periods"
 *
 * Example: ./backtester.js gdax.ETH-USD --days=10 --currency_capital=5 --period=1m
*/

let shell     = require('shelljs');
let parallel  = require('run-parallel-limit');
let json2csv  = require('json2csv');
let roundp    = require('round-precision');
let fs        = require('fs');

let VERSION = 'Zenbot 4.04 Backtester v0.2';

let PARALLEL_LIMIT = require('os').cpus().length;

let SELL_THRESHOLD_MIN = 0;
let SELL_THRESHOLD_MAX = 10;

let SELL_THRESHOLD_MAX_MIN = 0;
let SELL_THRESHOLD_MAX_MAX = 10;

let BUY_THRESHOLD_MIN = 0;
let BUY_THRESHOLD_MAX = 10;

let SELL_MIN_MIN = 0;
let SELL_MIN_MAX = 10;

let PERIOD_MIN = 27;
let PERIOD_MAX = 27;

let countArr = [];

let range = (start, end) => {
  return Array(end - start + 1).fill().map((_, idx) => start + idx)
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
  let command = `./zenbot.sh sim ${simArgs} --strategy=trust_distrust --period=${strategy.period}m --sell_threshold=${strategy.sell_threshold} --sell_threshold_max=${strategy.sell_threshold_max} --sell_min=${strategy.sell_min} --buy_threshold=${strategy.buy_threshold} --days=30`;
  console.log(`[ ${countArr.length}/${strategies.length} ] ${command}`);

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
  let wlRegexp      = /win\/loss: (\d+)\/(\d+)/g;
  let errRegexp     = /error rate: (.*)%/g;

  let output2 = output.substr(output.length - 3000);

  let rawParams     = jsonRegexp.exec(output2)[1];
  let params        = JSON.parse(rawParams);
  let endBalance    = endBalRegexp.exec(output2)[1];
  let wlMatch       = wlRegexp.exec(output2);
  let wins          = parseInt(wlMatch[1]);
  let losses        = parseInt(wlMatch[2]);
  let errorRate     = errRegexp.exec(output2)[1];
  let days          = parseInt(params.days);

  let roi = roundp(
    ((endBalance - params.currency_capital) / params.currency_capital) * 100,
    3
  );

  return {
    params:             rawParams.replace(/[\r\n]/g, ''),
    endBalance:         parseFloat(endBalance),
    wins:               wins,
    losses:             losses,
    errorRate:          parseFloat(errorRate),
    sellThreshold:           params.sell_threshold,
    sellThresholdMax:           params.sell_threshold_max,
    sellMin:        params.sell_min,
    buyThreshold: params.buy_threshold,
    days:               days,
    period:             params.period,
    roi:                roi,
    wlRatio:            losses > 0 ? roundp(wins / losses, 3) : 'Infinity',
    frequency:          roundp((wins + losses) / days, 3)
  };
};

let strategies = objectProduct({
  sell_threshold: range(SELL_THRESHOLD_MIN, SELL_THRESHOLD_MAX),
  sell_threshold_max: range(SELL_THRESHOLD_MAX_MIN, SELL_THRESHOLD_MAX_MAX),
  sell_min: range(SELL_MIN_MIN, SELL_MIN_MAX),
  buy_threshold: range(BUY_THRESHOLD_MIN, BUY_THRESHOLD_MAX),
  period: range(PERIOD_MIN, PERIOD_MAX)
});

let tasks = strategies.map(strategy => {
  return cb => {
    runCommand(strategy, cb)
  }
});

let args = process.argv;
args.shift();
args.shift();
let simArgs = args.join(' ');

console.log(`\n--==${VERSION}==--`);
console.log(new Date().toUTCString());
console.log(`\nBacktesting [${strategies.length}] iterations...\n`);

parallel(tasks, PARALLEL_LIMIT, (err, results) => {
  console.log("\nBacktesting complete, saving results...");
  results = results.filter(function (r) {
    return !!r
  })
  results.sort((a,b) => (a.roi < b.roi) ? 1 : ((b.roi < a.roi) ? -1 : 0));
  let fileName = `backtesting_${Math.round(+new Date()/1000)}.csv`;
  let csv = json2csv({
    data: results,
    fields: ['roi', 'errorRate', 'wlRatio', 'frequency', 'endBalance', 'wins', 'losses', 'period', 'days', 'sellThreshold', 'sellThresholdMax', 'sellMin', 'buyThreshold', 'params'],
    fieldNames: ['ROI (%)', 'Error Rate (%)', 'Win/Loss Ratio', '# Trades/Day', 'Ending Balance ($)', '# Wins', '# Losses', 'Period', '# Days', 'Sell Threshold', 'Sell Threshold Max', 'Sell Min', 'Buy Threshold', 'Full Parameters']
  });

  fs.writeFile(fileName, csv, err => {
    if (err) throw err;
    console.log(`\nResults successfully saved to ${fileName}!\n`);
  });
});
