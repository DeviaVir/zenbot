from functools import partial

from deap import base
from deap.tools import initRepeat, History, cxTwoPoint, mutGaussian

from conf import sigma, indpb
from evolution.breeding import breed
from evolution.core import algorithm
from evolution.mutation import mutate
from halloffame import ObjectiveFunctionHallOfFame
from .individual import Individual
from .initialization import initialize
from .selection import ownSelect, harsh_winter
from .utils import statsa
from scoop import futures


def evolve(evaluate, length_of_individual):

    Individual.mate = cxTwoPoint
    Individual.mutate = partial(mutGaussian, mu=0, sigma=sigma, indpb=indpb)

    toolbox = base.Toolbox()
    toolbox.register("map", futures.map)
    toolbox.register('select', harsh_winter)
    toolbox.register('breed', breed)
    toolbox.register('mutate', mutate)
    toolbox.register("individual", initRepeat, Individual, initialize, n=length_of_individual)

    toolbox.register('evaluate', evaluate)

    history = History()
    stats = statsa()
    hof = ObjectiveFunctionHallOfFame(maxsize=15)
    return algorithm(toolbox, stats, history, hof)
