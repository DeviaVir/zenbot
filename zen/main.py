import sys
from functools import partial

from deap.tools import cxTwoPoint, mutGaussian

from conf import indpb, sigma
from evaluation import evaluate_zen, backfill, Andividual
from evolution import evolve

def main(instrument,days,partitions,strategy='trend_ema'):
    evaluate = partial(evaluate_zen,  days=days)
    Andividual.mate = cxTwoPoint
    Andividual.mutate = partial(mutGaussian, mu=0, sigma=sigma, indpb=indpb)
    Individual = partial(Andividual,strategy=strategy,instrument=instrument)
    res = evolve(evaluate, Individual,popsize)
    return res


if __name__ == '__main__':
    INSTRUMENT = sys.argv[1]
    TOTAL_DAYS = int(sys.argv[2])
    try:
        popsize = int(sys.argv[3])
    except:
        popsize = 10
    try:
        strategy= sys.argv[4]
    except:
        strategy = 'trend_ema'
    print("Backfilling..")
    backfill(INSTRUMENT,TOTAL_DAYS)
    print("Backfilling done")
    print("Evolving")
    res = main(INSTRUMENT,TOTAL_DAYS,popsize,strategy)
    print(res)
