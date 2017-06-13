import random

from conf import mutpb


def mutate(population):
    mutants = []
    for individual in population:
        if random.random() < mutpb:
            mutants.append(~individual)
    return mutants
