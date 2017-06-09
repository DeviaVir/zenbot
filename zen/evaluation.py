import os
import shlex
import subprocess

from conf import args

best = -1000
import sys



def evaluate_zen(ind, TRAIN_COMMAND, VALIDATION_COMMAND):
    global best
    kwargs = {param: fun(val) for (param, fun), val in zip(args.items(), ind)}
    params = ['--' + key + '=' + str(value) for key, value in kwargs.items()]
    try:
        output = runzen(' '.join([TRAIN_COMMAND] + params))
        fitness = (float(output),)
        if fitness[0] > best:
            print("\nCurrent best: ")
            print(' '.join([TRAIN_COMMAND] + params))
            print(fitness[0])
            best = fitness[0]
            print("On validation: ")
            print(runzen(' '.join([VALIDATION_COMMAND] + params)))
    except subprocess.CalledProcessError:
        print("\nillegal config")
        fitness = (-1000,)
    sys.stdout.write('.')
    sys.stdout.flush()
    return fitness


def runzen(cmdline):
    with open(os.devnull, 'w') as devnull:
        a = subprocess.check_output(shlex.split(cmdline),stderr=devnull)
    output = a.split('}')[-1].splitlines()[3].split(": ")[-1][:-1]
    return output
def backfill(S,INSTRUMENT,TOTAL_DAYS):
    cmdline='{cmd} backfill {instrument} --days={days}'.format(days=TOTAL_DAYS, instrument=INSTRUMENT, cmd=S)
    subprocess.check_output(shlex.split(cmdline))
