from evolution import evolve


def test_evolve():
    evolve(lambda x: ((sum(x),sum(x)*3,sum(x)),''),5,0.1,0.1,10)