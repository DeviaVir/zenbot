from mock import patch, MagicMock

from evaluation import evaluate_zen


def test_evaluate_zen_best():
    with patch('evaluation.runzen',MagicMock(return_value='5')) as cmd:
        res=evaluate_zen([1,2,3],'asd','bsd')
        assert res == (5.0,)
        cmd.assert_called_with('bsd --oversold_rsi=3.0 --period=2m --sell_stop_pct=0.01')
def test_evaluate_zen_not_best():
    with patch('evaluation.runzen',MagicMock(return_value='-1001')) as cmd:
        res=evaluate_zen([1,2,3],'asd','bsd')
        cmd.assert_called_with('asd --oversold_rsi=3.0 --period=2m --sell_stop_pct=0.01')
