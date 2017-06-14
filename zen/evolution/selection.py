import random
from operator import attrgetter
from typing import List

from termcolor import colored

from conf import selectivity, partitions
from evolution.individual import Individual


def harsh_winter(population: List[Individual], popsize: int) -> List[Individual]:
    print(colored("\n\nWinter has come, weeding out the unworthy.", 'blue'))

    elitist_fraction = int(popsize * 0.2)
    elites = set(sorted(population, key=attrgetter('objective'), reverse=True)[:elitist_fraction])
    print(f"{len(elites)} Elites will survive, they're currently the strongest:")
    for elite in elites:
        print(elite)

    specialist_fraction = int(popsize * 0.4 / partitions)
    guilds = [sorted(population, reverse=True, key=lambda x: x.fitness.values[i]) for i in range(partitions)]
    specialists = set([ind for specialists in guilds for ind in specialists[:specialist_fraction]])
    print(f"{len(specialists)} Specialists will survive, they're the best in their domain:")
    for specialist in specialists:
        print(specialist)

    survivors = elites.union(specialists)
    difference = set(population).difference(survivors)
    rest = ownSelect(difference, k=popsize - len(survivors), tournsize=int(popsize * selectivity))
    print(f"Some other have fought their way through:")
    for r in rest[:5]:
        print(r)
        print(colored('...','grey'))
    population = list(survivors) + rest
    return population


def ownSelect(individuals, k, tournsize):
    return [max(random.sample(individuals, tournsize), key=attrgetter("objective")) for _ in range(k)]
