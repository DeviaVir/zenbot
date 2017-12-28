import datetime
import shlex

import subprocess
from fabric.api import run, cd, local


def sim(instrument, days, popsize, strategy):
    with cd('zenbot'):
        params = dict(instrument=instrument, days=days, strategy=strategy, popsize=popsize,
                      timestamp=datetime.datetime.now().strftime('%Y-%m-%d-%H-%M'))
        cmd = "cd scripts/genetic_algo && python -m scoop main.py {instrument} {days} {popsize} {strategy}".format(**params)
        total = '(nohup docker-compose exec -T server bash -c "{cmd}" > {instrument}_{strategy}_{days}_{popsize}_{timestamp}.out 2>&1 &) && sleep 1'.format(
            cmd=cmd, **params)
        print(total)
        run(total)


def remote(cmd, logfile):
    with cd('zenbot'):
        total = '(nohup docker-compose exec -T server bash -c "{cmd}" > {logfile} 2>&1 &) && sleep 1'.format(
            cmd=cmd,
            logfile=logfile)
        print(total)
        run(total)


def backfill_remote(TOTAL_DAYS):
    products = ['gdax.BTC-EUR', 'gdax.BTC-USD', 'gdax.BTC-GBP']+['gdax.ETH-BTC', 'poloniex.ETH-BTC']
    for instrument in products:
        cmd = 'env node ../../zenbot.js backfill {instrument} --days {days}'.format(days=TOTAL_DAYS, instrument=instrument)
        remote(cmd, 'backfill_'+instrument)


def backfill_local(TOTAL_DAYS):
    products = ['gdax.BTC-EUR', 'gdax.BTC-USD', 'gdax.BTC-GBP']+['gdax.ETH-BTC', 'poloniex.ETH-BTC']
    for instrument in products:
        cmd = 'env node ../../zenbot.js backfill {instrument} --days {days}'.format(days=TOTAL_DAYS, instrument=instrument)
        local(cmd)
