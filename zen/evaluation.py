import datetime
import os
import random
import shlex
import subprocess
import sys

from termcolor import colored

from conf import partitions
from evolution.individual import Individual
from objective_function import soft_maximum_worst_case

Y_M_D = "%Y-%m-%d"


def pct(x):
    return x / 100.0


def minutes(x):
    return str(int(x)) + 'm'


def runzen(cmdline):
    with open(os.devnull, 'w') as devnull:
        a = subprocess.check_output(shlex.split(cmdline), stderr=devnull)
    profit = a.split(b'}')[-1].splitlines()[3].split(b': ')[-1][:-1]
    trades = parse_trades(a.split(b'}')[-1].splitlines()[4])
    return profit, trades


def evaluate_zen(ind, days):
    periods = time_params(days, partitions)
    try:
        fitness = []
        for period in periods:
            cmd = ' '.join([ind.cmdline, period])
            output = runzen(cmd)
            fitness.append(float(output[0]) if float(output[1]) > 0.5 else -100)
    except subprocess.CalledProcessError:
        fitness = [-100 for _ in periods]
    sys.stdout.write('.')
    sys.stdout.flush()
    return tuple(fitness)


def time_params(days, partitions):
    now = datetime.datetime.now()
    delta = datetime.timedelta(days=days)
    splits = [now - delta / partitions * i for i in range(partitions + 1)][::-1]

    def startend(start, end):
        return ' --start {start} --end {end}'.format(start=start.strftime(Y_M_D), end=end.strftime(Y_M_D))

    return [startend(start, end) for start, end in zip(splits, splits[1:])]


class Andividual(Individual):
    BASE_COMMAND = '/app/zenbot.sh sim {instrument} --strategy {strategy}'

    def __init__(self, *args, strategy, instrument, **kwargs):
        super(Andividual, self).__init__(*args, **kwargs)
        self.args = args_for_strategy(strategy)
        self.instruments = parse_selectors(instrument)
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
    def params(self):
        def format(key, value):
            if isinstance(value, float):
                return f'--{key} {value:.4f}'
            else:
                return f'--{key} {value}'

        params = [format(key, value) for key, value in self.compress()]
        return params

    @property
    def cmdline(self):
        base = self.BASE_COMMAND.format(instrument=self.instrument, strategy=self.strategy)
        result = ' '.join([base] + self.params)
        print(result)
        return result

    def normalize(self, value, period):
        return (value / period)

    def convert(self, param, value):
        if param == 'period':
            res = minutes(value)
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


def parse_trades(stuff):
    """
    >>> parse_trades("1 trades over 17 days (avg 0.06 trades/day)")
    '0.06'
    :param stuff:
    :return:
    """
    return stuff.split(b'avg')[-1].strip().split()[0]


def args_for_strategy(strat):
    available = subprocess.check_output(shlex.split('/app/zenbot.sh list-strategies'))
    strats = [strat.strip() for strat in available.split(b'\n\n')]
    groups = [group.splitlines() for group in strats]
    output = {split[0].split()[0]: split[1:] for split in groups if split}
    result = {strategy: [line.strip().strip(b'-').split(b'=')[0] for line in lines if b'--' in line] for strategy, lines
              in
              output.items()}
    result = {key.decode(): [p.decode() for p in val] for key, val in result.items()}
    result = {key: [p for p in val if not p == 'min_periods'] for key, val in result.items()}

    return result[strat]


def parse_selectors(product):
    currencies = ['USD', 'EUR', 'GBP']
    real_stuff = [f'gdax.BTC-{currency}' for currency in currencies]
    imaginary_stuff = ['poloniex.ETH-BTC','gdax.ETH-BTC']
    if "BTC-CUR" in product:
        return real_stuff
    elif 'ETH-BTC' in product:
        return imaginary_stuff
    raise ValueError("Please specify either ETH-BTC or BTC-CUR")
