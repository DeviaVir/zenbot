from unittest.mock import MagicMock

from evolution.objective_function import obj


def test_obj():
    k = lambda x:MagicMock(fitness=MagicMock(values=x))
    assert obj(MagicMock(fitness=MagicMock(values=[1,-1.1]))) < obj(MagicMock(fitness=MagicMock(values=[0.1,-0.1])))
    assert obj(k([17,-5])) < obj(MagicMock(fitness=MagicMock(values=[7,5])))
    print(obj(k([10,10,10,2,10])),obj(k([1,1,1,1,1])))
    assert obj(k([10,10,10,-10,10]))<obj(k([1,1,1,1,1]))
    assert obj(k([-100,-100]))<obj(k([1,1,1,1,1]))
