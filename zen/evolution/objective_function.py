import math


def obj(ind):
    return math.log(sum(math.exp(f) for f in ind.fitness.values))