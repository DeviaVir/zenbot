import random
from operator import attrgetter
from typing import List, Iterable

from termcolor import colored

from conf import selectivity, partitions
from evolution.individual_base import Individual


def harsh_winter(population: List[Individual], count: int) -> List[Individual]:
    """ Selects `popsize` many individuals from the current population."""
    elitist_count = int(count * 0.2)
    specialist_count = int(count * 0.4 / partitions)

    elites = select_elites(population, elitist_count)
    specialists = select_specialists(population, specialist_count)
    survivors = elites.union(specialists)
    difference = set(population).difference(survivors)
    rest = select_rest(difference, count - len(survivors))

    population = list(survivors) + rest
    log_stuff(elites, rest, specialists)
    return population


def select_rest(individuals: Iterable[Individual], count: int):
    def ownSelect(individuals, k, tournsize):
        return [max(random.sample(individuals, tournsize), key=attrgetter("objective")) for _ in range(k)]

    rest = ownSelect(individuals, k=count, tournsize=int(len(individuals) * selectivity))
    return rest


def select_elites(individuals: Iterable[Individual], count: int):
    elites = set(sorted(individuals, key=attrgetter('objective'), reverse=True)[:count])
    return elites


def select_specialists(individuals: Iterable[Individual], count: int):
    guilds = [sorted(individuals, reverse=True, key=lambda x: x.fitness.values[i]) for i in range(partitions)]
    specialists = set([ind for specialists in guilds for ind in specialists[:count]])
    return specialists


def log_stuff(elites, rest, specialists):
    print(colored("\n\nWinter has come, weeding out the unworthy.", 'blue'))
    print(f"{len(elites)} Elites will survive, they're currently the strongest:")
    for elite in sorted(elites, key=attrgetter('objective'), reverse=True):
        print(elite)
    print(f"{len(specialists)} Specialists will survive, they're the best in their domain:")
    for specialist in specialists:
        print(specialist)
    print(f"Some other have fought their way through:")
    for r in rest[:5]:
        print(r)
    print(colored('...', 'grey'))
