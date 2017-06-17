import random

from deap.tools import History, Statistics
from termcolor import colored

from conf import cxpb, mutpb
from .utils import log_stuff


def algorithm(toolbox, stats:Statistics, history:History, hof, popsize:int):
    # Create initial Population and evaluate it
    population = [toolbox.individual() for _ in range(popsize)]
    evaluate(population, toolbox)
    # Commence evolution
    for g in range(0, 1000 ):
        log_stuff(g, history, hof, population, stats, toolbox)
        offspring = toolbox.breed(population)
        mutants = toolbox.mutate(offspring + population)
        evaluate(offspring + mutants + population, toolbox)
        survivors = toolbox.select(offspring + mutants + population)
        population[:]=survivors

    return hof


def evaluate(population, toolbox):
    invalid_ind = [ind for ind in population if not ind.fitness.valid]
    print(colored(f"Summer is here, need to evaluate {len(invalid_ind)} individuals",'blue'))
    print(' '*len(invalid_ind)+'|')
    fitnesses = toolbox.map(toolbox.evaluate, invalid_ind)
    for ind, fit in zip(invalid_ind, fitnesses):
        ind.fitness.values = fit


def breed(population):
    print(colored(f"It's breeding season, we're expecting new members of the tribe.",'blue'))
    offspring = []
    while len(offspring) < len(population) * cxpb:
        parent1, parent2 = random.sample(population, 2)
        child1, child2 = parent1 + parent2
        offspring.append(child1)
        offspring.append(child2)
    print(colored(len(offspring),'green')+colored(f" children have been born.",'blue'))
    return offspring


def mutate(population):
    print(colored(f"Radiation and toxic waste is causing mutations in the population...",'blue'))
    mutants = []
    for individual in population:
        if random.random() < mutpb:
            mutants.append(~individual)
    print(colored(len(mutants),'green')+colored(f" individuals have mutated.",'blue'))
    return mutants
