import random

from deap.tools import History, Statistics
from blessings import Terminal

from conf import cxpb, mutpb
from .utils import log_stuff

term = Terminal()

def algorithm(individual,popsize,map,evaluate,select,breed,mutate,stats,history,hof):
    # Create initial Population and evaluate it
    population = set()
    print(term.blue("Sampling an initial valid population, this may take a while..."))
    while len(population) < popsize:
        print(term.blue(f"\nCurrently {len(population)} valid individuals"))
        would_be = [individual() for _ in range(popsize)]
        evaluate_group(would_be,map,evaluate)
        population = population | set(would_be)
    # Commence evolution
    for g in range(0, 1000):
        log_stuff(g, history, hof, population, stats)
        print(term.blue("It's breeding season, we're expecting new members of the tribe..."))
        offspring = breed(population)
        print(term.blue("Radiation and toxic waste are causing mutations in the population..."))
        mutants = mutate(population)
        print(term.blue("Summer is here, evaluating our new arrivals..."))
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
        offspstr = str(len(offspring))
    print(term.green(offspstr) + term.blue(" children have been born."))
    return offspring


def mutate(population):
    mutants = []
    for individual in population:
        mutstr = str(len(mutants))
        if random.random() < mutpb:
            mutants.append(~individual)
    print(term.green(mutstr) + term.blue(" individuals have mutated."))
    return mutants
