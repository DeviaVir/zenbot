from mock import MagicMock

from evolution.objective_function import obj


def test_obj():
    assert obj(MagicMock(fitness=MagicMock(values=[1,-1.1]))) < obj(MagicMock(fitness=MagicMock(values=[0.1,-0.1])))
    assert obj(MagicMock(fitness=MagicMock(values=[17,-5]))) < obj(MagicMock(fitness=MagicMock(values=[7,5])))
