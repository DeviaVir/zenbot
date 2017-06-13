import random
from operator import itemgetter

from conf import popsize, selectivity
from evolution.objective_function import obj


def harsh_winter(population):
    specialist_fraction = int(popsize * 0.2 / len(population[0]))
    elitist_fraction = int(popsize * 0.2)
    guilds = [sorted(population,reverse=True, key=itemgetter(i)) for i in range(len(population[0]))]
    specialists = [ind for specialists in guilds for ind in specialists[:specialist_fraction]]
    elites = sorted(population, key=obj,reverse=True)[:elitist_fraction]
    population = specialists + elites + ownSelect(population, k=popsize, tournsize=int(popsize * selectivity))
    return population[:popsize]


def ownSelect(individuals, k, tournsize):
    return [max(random.sample(individuals, tournsize), key=obj) for _ in range(k)]
