import random
from operator import attrgetter
from typing import Iterable, Set

from termcolor import colored

from conf import partitions
from evolution.individual_base import Individual


def harsh_winter(population: Set[Individual], count: int) -> Set[Individual]:
    """ Selects `popsize` many individuals from the current population."""
    elitist_count = int(count * 0.3)
    specialist_count = int(count * 0.4 / partitions)
    elites = select_elites(population, elitist_count)
    difference = population - elites
    specialists = select_specialists(difference, specialist_count)
    survivors = elites | specialists
    difference = population - survivors
    if difference:
        rest = set(random.sample(difference, count - len(survivors)))
        population = survivors | rest
    else:
        rest = set()
        population = survivors
    log_stuff(elites, rest, specialists)
    return population


def select_elites(individuals: Iterable[Individual], count: int):
    elites = set(sorted(individuals, key=attrgetter('objective'), reverse=True)[:count])
    return elites


def select_specialists(individuals: Iterable[Individual], count: int):
    guilds = [sorted(individuals, reverse=True, key=lambda x: x.fitness.values[i]) for i in range(partitions)]
    specialists = set([ind for specialists in guilds for ind in specialists[:count]])
    return specialists


def log_stuff(elites, rest: Set, specialists):
    print(colored("\n\nWinter has come, weeding out the unworthy.", 'blue'))
    print(f"{len(elites)} Elites will survive, they're currently the strongest:")
    for elite in sorted(elites, key=attrgetter('objective'), reverse=True):
        print(elite)
    print(f"{len(specialists)} Specialists will survive, they're the best in their domain:")
    for specialist in specialists:
        print(specialist)
    print(f"Some other have fought their way through:")
    for r in random.sample(rest, len(rest) // 5):
        print(r)
    print(colored('...', 'grey'))
