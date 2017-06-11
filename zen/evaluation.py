import datetime
import os
import shlex
import subprocess

from conf import args, partitions

import sys

Y_M_D = "%Y-%m-%d"




def evaluate_zen(ind, instrument, days):
    BASE_COMMAND = '/app/zenbot.sh sim {instrument} '.format(instrument=instrument)
    periods =time_params(days, partitions)
    kwargs = {param: fun(val) for (param, fun), val in zip(args.items(), ind)}
    params = ['--' + key + '=' + str(value) for key, value in kwargs.items()]
    try:
        fitness=[]
        for period in periods:
            cmd = ' '.join([BASE_COMMAND] +[period]+ params)
            output = runzen(cmd)
            fitness.append(float(output))
        ind.cmdline = ' '.join([BASE_COMMAND]+[periods[0]] + params)
    except subprocess.CalledProcessError:
        print("\nillegal config")
        fitness = [-1000 for _ in periods]
    sys.stdout.write('.')
    sys.stdout.flush()
    return tuple(fitness),' '.join([BASE_COMMAND] + params)


def time_params(days, partitions):
    now = datetime.datetime.now()
    delta = datetime.timedelta(days=days)
    splits = [now - delta / partitions * i for i in range(partitions + 1)][::-1]
    def startend(start, end):
        return ' --start={start} --end={end}'.format(start=start.strftime(Y_M_D), end=end.strftime(Y_M_D))
    return [startend(start, end) for start, end in zip(splits, splits[1:])]


def runzen(cmdline):
    with open(os.devnull, 'w') as devnull:
        a = subprocess.check_output(shlex.split(cmdline), stderr=devnull)
    output = a.split('}')[-1].splitlines()[3].split(": ")[-1][:-1]
    return output


def backfill( INSTRUMENT, TOTAL_DAYS):
    cmdline = '/app/zenbot.sh backfill {instrument} --days={days}'.format(days=TOTAL_DAYS, instrument=INSTRUMENT)
    subprocess.check_output(shlex.split(cmdline))
