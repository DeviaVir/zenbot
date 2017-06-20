import datetime
import os
import random
import shlex
import subprocess
import sys
from typing import List

from termcolor import colored

from conf import partitions
from constants import Product, Selector
from evolution.individual_base import Individual
from objective_function import soft_maximum_worst_case
from parsing import parse_trades, args_for_strategy


def pct(x):
    return x / 100.0


def minutes(x):
    return str(int(x)) + 'm'


def runzen(cmdline):
    with open(os.devnull, 'w') as devnull:
        a = subprocess.check_output(shlex.split(cmdline), stderr=devnull)
    profit = a.split(b'}')[-1].splitlines()[3].split(b': ')[-1][:-1]
    trades = parse_trades(a.split(b'}')[-1].splitlines()[4])
    return float(profit), float(trades)


class Andividual(Individual):
    BASE_COMMAND = '/app/zenbot.sh sim {instrument} --strategy {strategy} --avg_slippage_pct 0.33'

    def __init__(self, *args, strategy: str, instrument: str, **kwargs):
        super(Andividual, self).__init__(*args, **kwargs)
        self.args = args_for_strategy(strategy)
        self.instruments = fuzz_product(instrument)
        self.strategy = strategy
        for _ in self.args:
            self.append(50 + (random.random() - 0.5) * 100)

    def __repr__(self):
        return colored(f"{self.cmdline}  {super(Andividual, self).__repr__()}", 'grey')

    @property
    def instrument(self):
        return random.choice(self.instruments)

    @property
    def objective(self):
        return soft_maximum_worst_case(self)

    def compress(self):
        res = dict(zip(self.args, self))
        period = res['period']
        del res['period']
        normalized = {param: self.normalize(value, period) if 'period' in param or param == 'trend_ema' else value for
                      param, value in
                      res.items()}
        normalized['period'] = period
        output = dict(self.convert(param, value) for param, value in normalized.items())
        return output.items()

    @property
    def params(self) -> List[str]:
        def format(key, value):
            if isinstance(value, float):
                return f'--{key} {value:.4f}'
            else:
                return f'--{key} {value}'

        params = [format(key, value) for key, value in self.compress()]
        return params

    @property
    def cmdline(self) -> str:
        base = self.BASE_COMMAND.format(instrument=self.instrument, strategy=self.strategy)
        result = ' '.join([base] + self.params)
        return result

    def normalize(self, value: float, period: int):
        return (value / period)

    def convert(self, param, value):
        if param == 'period':
            res = minutes(value)
        elif param == 'min_periods':
            res = int(value * 30)
        elif param == 'trend_ema':
            res = int(value * 5)
        elif 'period' in param:
            res = int(value * 5)
        elif 'pct' in param:
            res = pct(value)
        elif 'rate' in param:
            res = pct(value)
        elif 'rsi' in param:
            res = float(value)
        elif 'threshold' in param:
            res = pct(value)
        elif 'sar_af' == param:
            res = value / 1000.0
        elif 'sar_max_af' == param:
            res = pct(value)
        else:
            raise ValueError(colored(f"I don't understand {param} please add it to evaluation.py", 'red'))
        return param, res


def fuzz_product(product: Product) -> List[Selector]:
    """ We want to run against multiple selectors for a product to reduce sampling error.
    >>>fuzz_product('USD')"""
    selectors = {
        'BTC-CUR': ['gdax.BTC-USD', 'gdax.BTC-EUR', 'gdax.BTC-GBP'],
        'ETH-BTC': ['gdax.ETH-BTC']
    }
    return selectors[product]


def evaluate_zen(ind: Andividual, days: int):
    periods = time_params(days, partitions)
    try:
        fitness = []
        for period in periods:
            cmd = ' '.join([ind.cmdline, period])
            output = runzen(cmd)
            fitness.append(output[0])
        sys.stdout.write('.')
    except subprocess.CalledProcessError:
        fitness = [-100 for _ in periods]
        sys.stdout.write('x')
    sys.stdout.flush()
    return tuple(fitness)


def time_params(days: int, partitions: int) -> List[str]:
    now = datetime.date.today()
    delta = datetime.timedelta(days=days)
    splits = [now - delta / partitions * i for i in range(partitions + 1)][::-1]
    return [f' --start {start} --end {end}' for start, end in zip(splits, splits[1:])]
