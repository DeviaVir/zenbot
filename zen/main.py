import sys
from functools import partial

from deap.tools import cxTwoPoint, mutGaussian
from scoop import shared
from blessings import Terminal

from conf import indpb, sigma, partitions, selectors, path
from evaluation import evaluate_zen, Andividual
from evolution import evolve

term = Terminal()

def main(instrument, days, popsize, strategy='trend_ema'):
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


if __name__ == '__main__':
    INSTRUMENT = sys.argv[1]
    TOTAL_DAYS = int(sys.argv[2])
    try:
        popsize = int(sys.argv[3])
    except:
        popsize = 10
    try:
        strategy = sys.argv[4]
    except:
        strategy = 'trend_ema'
    print(term.red("MAKE SURE YOU RUN fab backfill_local:<days>"))
    print(term.red("otherwise it's all crap"))
    res = main(INSTRUMENT, TOTAL_DAYS, popsize, strategy)
    print(res)
