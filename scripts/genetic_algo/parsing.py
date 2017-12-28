import shlex
import subprocess
import re


def parse_trades(stuff):
    """
    >>> parse_trades("1 trades over 17 days (avg 0.06 trades/day)")
    '0.06'
    :param stuff:
    :return:
    """
    return stuff.split(b'avg')[-1].strip().split()[0]


def args_for_strategy(strat):
    ansi_escape = re.compile(b'\x1b[^m]*m')
    available = subprocess.check_output(shlex.split('env node ../../zenbot.js list-strategies'))
    strats = [ansi_escape.sub(b'', strat.strip()) for strat in available.split(b'\n\n')]
    groups = [group.splitlines() for group in strats]
    output = {split[0].split()[0]: split[1:] for split in groups if split}
    result = {strategy: [line.strip().strip(b'-').split(b'=')[0] for line in lines if b'--' in line] for strategy, lines
              in
              output.items()}
    result = {key.decode(): [p.decode() for p in val] for key, val in result.items()}

    return result[strat]
