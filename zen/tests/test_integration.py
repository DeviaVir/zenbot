import random

from mock import patch, MagicMock

from main import main

def myoutput(cmdline):
    print(cmdline)
    return str(random.random())
def test_integration():
    with patch('evaluation.runzen',myoutput) as cmd:
        with patch('evaluation.subprocess.check_output',myoutput):
            main('gdax.BTC-ETH',120)
