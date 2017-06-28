import datetime
import shlex
import subprocess
from fabric.api import run, cd,local
from zen import path, pyexc, selectors


def sim(instrument, days, popsize, strategy):
        params = dict(instrument=instrument, days=days, strategy=strategy, popsize=popsize,
                      timestamp=datetime.datetime.now().strftime('%Y-%m-%d-%H-%M'))
        cmd = "cd {path}/zen && {pyexc} -m scoop main.py {instrument} {days} {popsize} {strategy}".format(path=path, pyexc=pyexc, **params)
        total = '("{cmd}" > {instrument}_{strategy}_{days}_{popsize}_{timestamp}.out 2>&1 &) && sleep 1'.format(
            cmd=cmd, **params)
        print(total)
        run(total)

def remote(cmd,logfile):
        total = '("{cmd}" > {logfile} 2>&1 &) && sleep 1'.format(cmd=cmd, logfile=logfile)
        print(total)
        run(total)

def backfill_remote(selector, TOTAL_DAYS):
    products = selectors[selector]
    for instrument in products:
        cmd = '{path}/zenbot.sh backfill {instrument} --days {days}'.format(path=path, days=TOTAL_DAYS, instrument=instrument)
        remote(cmd,'backfill_'+instrument)

def backfill_local(selector, TOTAL_DAYS):
    products = selectors[selector]
    for instrument in products:
        cmd = '{path}/zenbot.sh backfill {instrument} --days {days}'.format(path=path, days=TOTAL_DAYS, instrument=instrument)
        local(cmd)
