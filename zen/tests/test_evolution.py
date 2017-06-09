from evolution import evolve


def test_evolve():
    evolve(lambda x: (sum(x),),5)