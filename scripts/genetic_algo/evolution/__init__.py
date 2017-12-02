from functools import partial

from deap.tools import History
from scoop import futures

from evolution.core import algorithm, breed, mutate
from halloffame import ObjectiveFunctionHallOfFame
from .selection import harsh_winter
from .utils import statsa


def evolve(evaluate, cls, popsize=10):
    select = partial(harsh_winter, count=popsize)

    history = History()
    stats = statsa()
    hof = ObjectiveFunctionHallOfFame(maxsize=15)
    return algorithm(cls, popsize, futures.map, evaluate, select, breed, mutate, stats, history, hof)
