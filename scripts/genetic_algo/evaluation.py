import datetime
import os
import random
import shlex
import subprocess
import sys
import re
from typing import List

from termcolor import colored

from conf import partitions
from evolution.individual_base import Individual
from objective_function import soft_maximum_worst_case
from parsing import parse_trades, args_for_strategy


def pct(x):
    return x / 100.0


def minutes(x):
    return str(int(x)) + 'm'


def runzen(cmdline):
    ansi_escape = re.compile(b'\x1b[^m]*m')
    with open(os.devnull, 'w') as devnull:
        a = subprocess.check_output(shlex.split(cmdline), stderr=devnull)
    profit = a.split(b'}')[-1].splitlines()[3].split(b': ')[-1]
    profit = ansi_escape.sub(b'', profit)[:-1]
    trades = parse_trades(a.split(b'}')[-1].splitlines()[4])
    trades = ansi_escape.sub(b'', trades)
    return float(profit), float(trades)


class Andividual(Individual):
    BASE_COMMAND = 'env node ../../zenbot.js sim {instrument} --strategy {strategy} --avg_slippage_pct 0.33 --filename temp.html'
    def __init__(self, *args,**kwargs):
        super(Andividual, self).__init__(*args, **kwargs)
        self.args = args_for_strategy(self.strategy)
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
                return f'--{key} {value:.6f}'
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
            res = minutes(int(value/2))
        elif param == 'min_periods':
            res = int(value*20)
        elif param == 'trend_ema':
            res = int(value*15)
        elif 'period' in param:
            res = int(value*10)
        elif 'pct' in param:
            res = pct(value)
        elif 'rate' in param:
            res = pct(value)
        elif 'rsi' in param:
            res = float(value)
        elif 'sell' in param:
            res = value/10.0
        elif 'buy' in param:
            res = value/10.0
        elif 'threshold' in param:
            res = value/100000.0
        elif 'sar_af' == param:
            res = value/1000.0
        elif 'sar_max_af' == param:
            res = pct(value)
        elif 'greed' == param:
            res = value/10.0
        else:
            raise ValueError(colored(f"I don't understand {param} please add it to evaluation.py", 'red'))
        return param, res




def evaluate_zen(cmdline:str, days: int):
    periods = time_params(days, partitions)
    try:
        fitness = []
        for period in periods:
            cmd = ' '.join([cmdline, period])
            f,t = runzen(cmd)
            fitness.append(f)
            if t==0:
                raise subprocess.CalledProcessError(-1,'TooFewTrades')
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
