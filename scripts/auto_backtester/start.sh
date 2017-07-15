#!/bin/sh
sudo rm -rf /zenbot4/scripts/auto_backtester/simulations
sudo rm -rf /zenbot4/scripts/auto_backtester/backtesting*
sudo mkdir /zenbot4/scripts/auto_backtester/simulations/
sudo cp /zenbot4/scripts/auto_backtester/index.php.graph /zenbot4/scripts/auto_backtester/simulations/index.php
cd /zenbot4/scripts/auto_backtester/
sudo python trend_ema.py