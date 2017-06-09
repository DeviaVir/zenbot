import datetime
import subprocess
import sys
from functools import partial

from conf import args
from evaluation import evaluate_zen, backfill
from evolution import evolve

Y_M_D = "%Y-%m-%d"

S = '/app/zenbot.sh'


def main(INSTRUMENT,TOTAL_DAYS):
    BASE_COMMAND = '{S} sim {instrument} '.format(instrument=INSTRUMENT, S=S) + '--start={start} --end={end}'
    now = datetime.datetime.now()
    TRAINING_START = now - datetime.timedelta(days=TOTAL_DAYS)
    TRAINING_END = now - datetime.timedelta(days=TOTAL_DAYS * 0.3)
    TRAIN_PARAMS = dict(
        start=TRAINING_START.strftime(Y_M_D),
        end=TRAINING_END.strftime(Y_M_D),
    )
    VALIDATION_PARAMS = dict(
        start=TRAINING_END.strftime(Y_M_D),
        end=now.strftime(Y_M_D),
    )
    TRAIN_COMMAND = BASE_COMMAND.format(**TRAIN_PARAMS)
    VALIDATION_COMMAND = BASE_COMMAND.format(**VALIDATION_PARAMS)
    evaluate = partial(evaluate_zen, TRAIN_COMMAND=TRAIN_COMMAND, VALIDATION_COMMAND=VALIDATION_COMMAND)
    res = evolve(evaluate, len(args))
    return res


if __name__ == '__main__':
    INSTRUMENT = sys.argv[1]
    TOTAL_DAYS = int(sys.argv[2])
    print("Backfilling..")
    backfill(S,INSTRUMENT,TOTAL_DAYS)
    print("Backfilling done")
    print("Evolving")
    res = main(INSTRUMENT,TOTAL_DAYS)
    print(res)
