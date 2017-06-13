from mock import patch, MagicMock

from evaluation import evaluate_zen, time_params
from evolution import Individual


def test_evaluate_zen():
    with patch('evaluation.runzen',MagicMock(return_value='-1001')) as cmd:
        res=evaluate_zen(Individual([1, 2, 3]), 'asd', 10)
        cmd.assert_called_with('/app/zenbot.sh sim asd   --start=2017-06-08 --end=2017-06-11 --sell_rate=0.03 --period=2m --sell_stop_pct=1.0')
def test_time_params():
    res= time_params(120,4)
    assert res ==[' --start=2017-02-11 --end=2017-03-13', ' --start=2017-03-13 --end=2017-04-12', ' --start=2017-04-12 --end=2017-05-12', ' --start=2017-05-12 --end=2017-06-11']
