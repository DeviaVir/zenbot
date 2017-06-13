from copy import deepcopy, copy

import names
from deap.base import Fitness

from conf import partitions


class FitnessMax(Fitness):
    weights = tuple([1 for _ in range(partitions)])


class Individual(list):
    mate = lambda *x: x
    mutate = lambda x: x

    def __init__(self, *args, **kwargs):
        self.name = names.get_full_name()
        self.fitness = FitnessMax()
        res = super(Individual, self).__init__(*args, **kwargs)
        self.cmdline = ''

    def __deepcopy__(self, memodict={}):
        obj = copy(self)
        obj.fitness = deepcopy(self.fitness)
        obj.name = names.get_full_name()
        return obj

    def __eq__(self, other):
        return other.name == self.name

    def __add__(self, other):
        child1, child2 = Individual.mate(deepcopy(self), deepcopy(other))
        del child1.fitness.values
        del child2.fitness.values
        return child1, child2

    def __invert__(self):
        mutant = Individual.mutate(deepcopy(self))[0]
        del mutant.fitness.values
        return mutant
    def __hash__(self):
        return hash(self.name)
