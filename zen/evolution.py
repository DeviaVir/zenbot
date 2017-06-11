import random
from functools import partial

import matplotlib.pyplot as plt
import networkx as networkx
import numpy
from deap import base
from deap import creator
from deap.tools import selTournament, cxTwoPoint, mutGaussian, initRepeat, Statistics, History

from conf import partitions, runid, popsize, selectivity
from halloffame import ObjectiveFunctionHallOfFame
from objective_function import obj


def initialize():
    return 50 + (random.random() - 0.5) * 50


def statsa():
    stats = Statistics(key=lambda ind: obj(ind))
    stats.register("avg", numpy.mean)
    stats.register("std", numpy.std)
    stats.register("min", numpy.min)
    stats.register("max", numpy.max)
    return stats


class CmdIndividual(list):
    def __init__(self, *args, **kwargs):
        self.cmdline = ""
        return super(CmdIndividual, self).__init__(*args, **kwargs)


class AlwaysOne(list):
    def __getitem__(self, item):
        return 1


creator.create("FitnessMax", base.Fitness, weights=[1 for _ in range(partitions)])
creator.create("Individual", CmdIndividual, fitness=creator.FitnessMax)


def ownSelect(individuals, k, tournsize):
    """Select *k* individuals from the input *individuals* using *k*
    tournaments of *tournsize* individuals. The list returned contains
    references to the input *individuals*.

    :param individuals: A list of individuals to select from.
    :param k: The number of individuals to select.
    :param tournsize: The number of individuals participating in each tournament.
    :returns: A list of selected individuals.

    This function uses the :func:`~random.choice` function from the python base
    :mod:`random` module.
    """
    chosen = []
    for i in xrange(k):
        aspirants = [random.choice(individuals) for i in xrange(tournsize)]
        chosen.append(max(aspirants, key=obj))
    return chosen


def evolve(evaluate, length_of_individual, cxpb=0.1, mutpb=0.1, ngen=1000):
    toolbox = base.Toolbox()
    from scoop import futures
    toolbox.register("map", futures.map)
    toolbox.register('select', partial(ownSelect, tournsize=int(popsize * selectivity)))
    toolbox.register('mate', cxTwoPoint)
    toolbox.register('mutate', partial(mutGaussian, mu=0, sigma=20, indpb=0.1))
    toolbox.register("individual", initRepeat, creator.Individual, initialize, n=length_of_individual)

    toolbox.register('evaluate', evaluate)

    history = History()
    stats = statsa()
    toolbox.decorate("mate", history.decorator)
    toolbox.decorate("mutate", history.decorator)
    return algorithm(toolbox, cxpb, mutpb, ngen, stats, history)


def draw(history, toolbox):
    ax = plt.figure()
    ax.set_figheight(30)
    ax.set_figwidth(30)
    graph = networkx.DiGraph(history.genealogy_tree)
    graph = graph.reverse()  # Make the grah top-down
    colors_inds = (history.genealogy_history[i] for i in graph)
    colors = [obj(ind) if ind.fitness.valid else -10 for ind in colors_inds]

    positions = networkx.drawing.nx_agraph.graphviz_layout(graph, prog="dot")

    networkx.draw(graph, positions, node_color=colors, ax=ax.add_subplot(111), figsize=(30, 30), node_size=150)
    ax.savefig('logs/history/{runid}.png'.format(runid=runid))


def algorithm(toolbox, cxpb, mutpb, ngen, stats, history):
    population = [toolbox.individual() for _ in range(popsize)]

    fitnesses = toolbox.map(toolbox.evaluate, population)
    for ind, fit in zip(population, fitnesses):
        ind.fitness.values = fit[0]
        ind.cmdline=fit[1]
    hof = ObjectiveFunctionHallOfFame(maxsize=15)
    log_stuff(0, history, hof, population, stats, toolbox)
    for g in range(1, ngen + 1):
        # Select the next generation individuals
        offspring = toolbox.select(population, len(population))
        # Clone the selected individuals
        offspring = map(toolbox.clone, offspring)

        # Apply crossover on the offspring
        for child1, child2 in zip(offspring[::2], offspring[1::2]):
            if random.random() < cxpb:
                if not child1.fitness == child2.fitness:
                    toolbox.mate(child1, child2)
                    del child1.fitness.values
                    del child2.fitness.values

        # Apply mutation on the offspring
        for mutant in offspring:
            if random.random() < mutpb:
                toolbox.mutate(mutant)
                del mutant.fitness.values

        # Evaluate the individuals with an invalid fitness
        invalid_ind = [ind for ind in offspring if not ind.fitness.valid]
        fitnesses = toolbox.map(toolbox.evaluate, invalid_ind)
        for ind, fit in zip(invalid_ind, fitnesses):
            ind.fitness.values = fit[0]
            ind.cmdline=fit[1]

        population[:] = offspring
        log_stuff(g, history, hof, population, stats, toolbox)

    return hof


def log_stuff(g, history, hof, population, stats, toolbox):
    draw(history, toolbox)
    record = stats.compile(population)
    hof.update(population)
    hof.persist()
    print('\nGeneration %s %s ' % (g, record))
    print(hof)
