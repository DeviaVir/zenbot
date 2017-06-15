import sys
from functools import partial

from deap.tools import cxTwoPoint, mutGaussian
from termcolor import colored

from conf import indpb, sigma
from evaluation import evaluate_zen, Andividual
from evolution import evolve


def main(instrument, days, partitions, strategy='trend_ema'):
    print(colored("Starting evolution....", 'blue'))
    evaluate = partial(evaluate_zen, days=days)
    print(colored(f"Evaluating over ", 'blue') + colored(str(days), 'green') + colored(' days.', 'blue'))
    Andividual.mate = cxTwoPoint
    Andividual.mutate = partial(mutGaussian, mu=0, sigma=sigma, indpb=indpb)
    Individual = partial(Andividual, strategy=strategy, instrument=instrument)
    print(colored(f"Mating function is ", 'blue') + colored(Andividual.mate, 'green'))
    print(colored(f"Mutating function is ", 'blue') + colored(Andividual.mutate, 'green'))
    res = evolve(evaluate, Individual, popsize)
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
    print(colored("MAKE SURE YOU RUN fab backfill:<days>", 'red'))
    print(colored("otherwise it's all crap", 'red'))
    res = main(INSTRUMENT, TOTAL_DAYS, popsize, strategy)
    print(res)
