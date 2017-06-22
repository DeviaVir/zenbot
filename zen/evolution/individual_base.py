from copy import deepcopy, copy

import names
from deap.base import Fitness

from conf import partitions


class FitnessMax(Fitness):
    weights = tuple([1 for _ in range(partitions)])


class Individual(list):
    mate = lambda *x: x
    mutate = lambda x: x

    @property
    def objective(self):
        return sum(self)

    def __repr__(self):
        return f"{list(self.fitness.values)} {self.objective} {self.name}"

    def __init__(self, *args, **kwargs):
        self.name = names.get_full_name()
        self.fitness = FitnessMax()
        super(Individual, self).__init__(*args, **kwargs)

    def __deepcopy__(self, memodict={}):
        obj = copy(self)
        obj.fitness = deepcopy(self.fitness)
        obj.name = names.get_full_name()
        return obj


    def __add__(self, other):
        child1, child2 = self.__class__.mate(deepcopy(self), deepcopy(other))
        if False:
            print(f"\nMating: with {self.__class__.mate}")
            print(self)
            print(other)
            print('Children:')
            print(child1)
            print(child2)
        del child1.fitness.values
        del child2.fitness.values
        return child1, child2

    def __invert__(self):
        mutant = self.__class__.mutate(deepcopy(self))[0]  # DON'T THINK ABOUT REMOVING THE ZERO
        if False:
            print(f"\nMutating: with {self.__class__.mutate}")
            print(self)
            print(mutant)
        del mutant.fitness.values
        return mutant
    def __eq__(self, other):
        return hash(self)==hash(other)
    def __hash__(self):
        return hash(tuple(self.fitness.values))
