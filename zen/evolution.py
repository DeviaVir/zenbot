import random
from functools import partial

from deap import base
from deap import creator
from deap.algorithms import eaSimple
from deap.tools import selTournament, cxTwoPoint, mutGaussian, initRepeat


def initialize():
    return 50 + (random.random() - 0.5) * 50


def evolve(evaluate, n):
    toolbox = base.Toolbox()
    toolbox.register('select', partial(selTournament, tournsize=10))
    toolbox.register('mate', cxTwoPoint)
    toolbox.register('mutate', partial(mutGaussian, mu=0, sigma=20, indpb=0.1))
    creator.create("FitnessMax", base.Fitness, weights=(1,))

    toolbox.register("attr_float", initialize)
    creator.create("Individual", list, fitness=creator.FitnessMax)
    toolbox.register("individual", initRepeat, creator.Individual, toolbox.attr_float, n=n)

    population = [toolbox.individual() for _ in range(100)]

    toolbox.register('evaluate', evaluate)
    return eaSimple(population=population, toolbox=toolbox, cxpb=0.1, mutpb=0.9, ngen=1000,verbose=True)
