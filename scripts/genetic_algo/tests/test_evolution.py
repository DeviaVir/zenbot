import random

from evolution import evolve
from evolution.individual import Individual


def test_evolve():
    class TestIndividual(Individual):
        def __init__(self,*args,**kwargs):
            super(TestIndividual, self).__init__(*args,**kwargs)
            for x in range(5):
                self.append(random.random())

    evolve(lambda x: ((sum(x), sum(x), sum(x))), TestIndividual)
