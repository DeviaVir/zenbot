import math


def obj(ind):
    def metric(fit):
        return math.copysign(math.sqrt(abs(fit)), fit)
    return sum(metric(fit) for fit in ind.fitness.values)