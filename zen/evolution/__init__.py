from functools import partial

from deap import base
from deap.tools import History

from evolution.core import algorithm, breed, mutate
from halloffame import ObjectiveFunctionHallOfFame
from .selection import harsh_winter
from .utils import statsa
from scoop import futures


def evolve(evaluate, Individual, popsize=10):

    toolbox = base.Toolbox()
    toolbox.register("map", futures.map)
    toolbox.register('select', partial(harsh_winter,count=popsize))
    toolbox.register('breed', breed)
    toolbox.register('mutate', mutate)
    toolbox.register("individual", Individual)

    toolbox.register('evaluate', evaluate)

    history = History()
    stats = statsa()
    hof = ObjectiveFunctionHallOfFame(maxsize=15)
    return algorithm(toolbox, stats, history, hof,popsize)
