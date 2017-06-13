import networkx as networkx
import numpy
from deap.tools import Statistics
from matplotlib import pyplot as plt

from conf import runid
from evolution.objective_function import obj


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


def log_stuff(g, history, hof, population, stats, toolbox):
    draw(history, toolbox)
    record = stats.compile(population)
    hof.update(population)
    hof.persist()
    print('\nGeneration %s %s ' % (g, record))
    print(hof)


def statsa():
    stats = Statistics(key=lambda ind: obj(ind))
    stats.register("avg", numpy.mean)
    stats.register("std", numpy.std)
    stats.register("min", numpy.min)
    stats.register("max", numpy.max)
    stats.register("len", len)
    return stats