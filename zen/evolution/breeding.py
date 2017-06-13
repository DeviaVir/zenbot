import random
from conf import cxpb


def breed(population):
    offspring = []
    while len(offspring) < len(population) * cxpb:
        parent1, parent2 = random.sample(population, 2)
        child1, child2 = parent1 + parent2
        offspring.append(child1)
        offspring.append(child2)
    return offspring
