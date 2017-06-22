import random

from deap.tools import History, Statistics
from termcolor import colored

from conf import cxpb, mutpb
from .utils import log_stuff


def algorithm(individual,popsize,map,evaluate,select,breed,mutate,stats,history,hof):
    # Create initial Population and evaluate it
    population = set()
    print(colored(f"Sampling an initial valid population, this may take a while...", 'blue'))
    while len(population) < popsize:
        print(colored(f"Currently {len(population)} valid individuals", 'blue'))
        would_be = [individual() for _ in range(popsize)]
        evaluate_group(would_be,map,evaluate)
        population = population | set(would_be)
    # Commence evolution
    for g in range(0, 1000):
        log_stuff(g, history, hof, population, stats)
        print(colored(f"It's breeding season, we're expecting new members of the tribe...", 'blue'))
        offspring = breed(population)
        print(colored(f"Radiation and toxic waste are causing mutations in the population...", 'blue'))
        mutants = mutate(population)
        print(colored(f"Summer is here, evaluating our new arrivals...", 'blue'))
        evaluate_group(offspring + mutants, map,evaluate)
        survivors = select(set(offspring) | set(mutants) | population)
        population = survivors

    return hof


def evaluate_group(population, map, evaluate):
    invalid_ind = [ind for ind in population if not ind.fitness.valid]
    print(' ' * len(invalid_ind) + '|')
    fitnesses = map(evaluate, [ind.cmdline for ind in invalid_ind])
    for ind, fit in zip(invalid_ind, fitnesses):
        ind.fitness.values = fit


def breed(population):
    offspring = []
    while len(offspring) < len(population) * cxpb:
        parent1, parent2 = random.sample(population, 2)
        child1, child2 = parent1 + parent2
        offspring.append(child1)
        offspring.append(child2)
    print(colored(len(offspring), 'green') + colored(f" children have been born.", 'blue'))
    return offspring


def mutate(population):
    mutants = []
    for individual in population:
        if random.random() < mutpb:
            mutants.append(~individual)
    print(colored(len(mutants), 'green') + colored(f" individuals have mutated.", 'blue'))
    return mutants
