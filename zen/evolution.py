import random
from functools import partial

import networkx as networkx
import numpy
from deap import base
from deap import creator
from deap.tools import selTournament, cxTwoPoint, mutGaussian, initRepeat, Statistics, History, HallOfFame
import matplotlib.pyplot as plt
runid=random.randint(1000,9999)

def initialize():
    return 50 + (random.random() - 0.5) * 50


def statsa():
    stats = Statistics(key=lambda ind: ind.fitness.values)
    stats.register("avg", numpy.mean)
    stats.register("std", numpy.std)
    stats.register("min", numpy.min)
    stats.register("max", numpy.max)
    return stats


class CmdIndividual(list):
    def __init__(self, *args, **kwargs):
        self.cmdline = ""
        return super(CmdIndividual, self).__init__(*args, **kwargs)

creator.create("FitnessMax", base.Fitness, weights=(1,))
creator.create("Individual", CmdIndividual, fitness=creator.FitnessMax)

def evolve(evaluate, length_of_individual, cxpb=0.3, mutpb=0.1, ngen=150):
    toolbox = base.Toolbox()
    try:
        from scoop import futures
        toolbox.register("map", futures.map)
        print("Running Multicore")
    except ImportError:
        print("No scoop, running single core")
    toolbox.register('select', partial(selTournament, tournsize=5))
    toolbox.register('mate', cxTwoPoint)
    toolbox.register('mutate', partial(mutGaussian, mu=0, sigma=20, indpb=0.5))
    toolbox.register("individual", initRepeat, creator.Individual, initialize, n=length_of_individual)

    toolbox.register('evaluate', evaluate)

    history = History()
    stats = statsa()
    toolbox.decorate("mate", history.decorator)
    toolbox.decorate("mutate", history.decorator)
    return algorithm(toolbox, cxpb, mutpb, ngen, stats, history)


def draw(history, toolbox):
    ax=plt.figure()
    ax.set_figheight(30)
    ax.set_figwidth(30)
    graph = networkx.DiGraph(history.genealogy_tree)
    graph = graph.reverse()     # Make the grah top-down
    colors = [toolbox.evaluate(history.genealogy_history[i])[0] for i in graph]
    colors = [x for x in colors if x != -1000]
    positions = networkx.drawing.nx_agraph.graphviz_layout(graph, prog="dot")

    networkx.draw(graph, positions, node_color=colors,ax=ax.add_subplot(111),figsize=(30,30),node_size=150)
    ax.savefig('history_{runid}.png'.format(runid=runid))




def algorithm(toolbox, cxpb, mutpb, ngen, stats, history):
    population = [toolbox.individual() for _ in range(100)]
    hof = HallOfFame(maxsize=30)
    for g in range(ngen):
        # Select the next generation individuals
        offspring = toolbox.select(population, len(population))
        # Clone the selected individuals
        offspring = map(toolbox.clone, offspring)

        # Apply crossover on the offspring
        for child1, child2 in zip(offspring[::2], offspring[1::2]):
            if random.random() < cxpb:
                if not child1.fitness==child2.fitness:
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
            ind.fitness.values = fit

        population[:] = offspring
        record = stats.compile(population)
        print('Generation %s %s ' %( g,record ))
        hof.update(population)
        with open('hall_of_fame_{runid}.txt'.format(runid=runid),'w') as f:
            for ind in hof:
                f.write("%s %s\n" %(ind.cmdline, ind.fitness.values[0]))
        draw(history,toolbox)

    return hof
