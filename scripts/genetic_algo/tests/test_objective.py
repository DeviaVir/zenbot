from unittest.mock import MagicMock

from objective_function import soft_maximum_worst_case


def test_obj():
    k = lambda x: MagicMock(fitness=MagicMock(values=x))
    assert soft_maximum_worst_case(MagicMock(fitness=MagicMock(values=[1, -1.1]))) < soft_maximum_worst_case(MagicMock(fitness=MagicMock(values=[0.1, -0.1])))
    assert soft_maximum_worst_case(k([17, -5])) < soft_maximum_worst_case(MagicMock(fitness=MagicMock(values=[7, 5])))
    print(soft_maximum_worst_case(k([10, 10, 10, 2, 10])), soft_maximum_worst_case(k([1, 1, 1, 1, 1])))
    assert soft_maximum_worst_case(k([10, 10, 10, -10, 10])) < soft_maximum_worst_case(k([1, 1, 1, 1, 1]))
    assert soft_maximum_worst_case(k([-100, -100])) < soft_maximum_worst_case(k([1, 1, 1, 1, 1]))
