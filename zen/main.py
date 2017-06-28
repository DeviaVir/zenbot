import sys
from functools import partial
from timer import ThreadTimer
from deap.tools import cxTwoPoint, mutGaussian
from scoop import shared
from blessings import Terminal
from subprocess import run, DEVNULL
from conf import indpb, sigma, partitions, selectors, path, bkfint
from evaluation import evaluate_zen, Andividual
from evolution import evolve

term = Terminal()

def main(instrument, days, popsize, strategy='trend_ema', nobf=None):
    print(term.blue("Starting evolution...."))
    evaluate = partial(evaluate_zen, days=days)
    print(term.blue("Evaluating ") + term.green(str(popsize)) + term.blue(" individuals over ")
    + term.green(str(days)) + term.blue(" days in ") + term.green(str(partitions)) + term.blue(" partitions."))
    Andividual.path = path
    Andividual.instruments = selectors[instrument]
    Andividual.mate = cxTwoPoint
    Andividual.mutate = partial(mutGaussian, mu=0, sigma=sigma, indpb=indpb)
    Andividual.strategy = strategy
    print(term.blue("Mating function is ") + term.green(str(Andividual.mate)))
    print(term.blue("Mutating function is ") + term.green(str(Andividual.mutate)))
    res = evolve(evaluate, Andividual, popsize)
    return res

def bkfcmd():
    run(f"cd {path} && fab backfill_local:\"{INSTRUMENT},{TOTAL_DAYS}\"", shell=True, stdout=DEVNULL)
    return

if __name__ == '__main__':
    INSTRUMENT = sys.argv[1]
    TOTAL_DAYS = int(sys.argv[2])
    try:
        popsize = int(sys.argv[3])
    except:
        popsize = 10
    if popsize < 10:
        popsize = 10
        print(term.red("Minimum population size is 10, overriding..."))
    try:
        strategy = sys.argv[4]
    except:
        strategy = 'trend_ema'
    try:
        nobf = sys.argv[5]
        if nobf == "backfill":
            bkf = True
    except:
        bkf = False
    if bkf == True:
        print(term.green("Auto backfilling is ON"))
        print(term.green("Executing inital backfilling, please wait..."))
        bkfcmd()
        if bkfint < 600:
            print(term.red("Minimum interval for auto backfilling is 600 secs, overriding..."))
            bkfint = 600
        print(term.green("Done"))
        print(term.green(f"Auto backfilling interval is {bkfint} secs"))
        ThreadTimer(bkfint, bkfcmd)
    else:
        print(term.red("You don\'t have enabled autobackfill,"))
        print(term.red("MAKE SURE YOU RUN fab backfill_local:\"<selector>,<days>\""))
        print(term.red("otherwise it's all crap"))
    res = main(INSTRUMENT, TOTAL_DAYS, popsize, strategy)
    print(res)
