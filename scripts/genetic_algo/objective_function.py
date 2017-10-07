import math

sum = sum


def soft_maximum_worst_case(ind):
    return -math.log(sum(math.exp(-f) for f in ind.fitness.values)+0.0000000000001)
