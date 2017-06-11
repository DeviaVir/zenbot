import sys
from functools import partial

from conf import args, partitions
from evaluation import evaluate_zen, backfill
from evolution import evolve

def main(instrument,days):
    evaluate = partial(evaluate_zen, instrument=instrument, days=days)
    res = evolve(evaluate, len(args))
    return res


if __name__ == '__main__':
    INSTRUMENT = sys.argv[1]
    TOTAL_DAYS = int(sys.argv[2])
    print("Backfilling..")
    backfill(INSTRUMENT,TOTAL_DAYS)
    print("Backfilling done")
    print("Evolving")
    res = main(INSTRUMENT,TOTAL_DAYS)
    print(res)
