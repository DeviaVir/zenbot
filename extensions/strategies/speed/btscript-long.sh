#!/bin/bash
sudo ./zenbot.sh backfill gdax.LTC-USD --days=0.14
sudo ./zenbot.sh backfill gdax.ETH-USD --days=0.14
sudo ./zenbot.sh backfill gdax.BTC-USD --days=0.14
while :
do
    # TASK 1
    date
    echo "Press b for BTC, e for ETH, l for LTC"
    read -t 1 -n 1 key
    if [[ $key = b ]]
    then
sudo ./zenbot.sh sim --period=100ms --meas=90 --min_periods=3050 --strategy=speed --days=3 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=91 --min_periods=3050 --strategy=speed --days=3 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=92 --min_periods=3050 --strategy=speed --days=3 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=93 --min_periods=3050 --strategy=speed --days=3 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=94 --min_periods=3050 --strategy=speed --days=3 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=95 --min_periods=3050 --strategy=speed --days=3 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=96 --min_periods=3050 --strategy=speed --days=3 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=97 --min_periods=3050 --strategy=speed --days=3 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=98 --min_periods=3050 --strategy=speed --days=3 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=99 --min_periods=3050 --strategy=speed --days=3 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=100 --min_periods=3050 --strategy=speed --days=3 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=101 --min_periods=3050 --strategy=speed --days=3 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=102 --min_periods=3050 --strategy=speed --days=3 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=103 --min_periods=3050 --strategy=speed --days=3 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=104 --min_periods=3050 --strategy=speed --days=3 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=105 --min_periods=3050 --strategy=speed --days=3 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=106 --min_periods=3050 --strategy=speed --days=3 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=107 --min_periods=3050 --strategy=speed --days=3 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=108 --min_periods=3050 --strategy=speed --days=3 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=109 --min_periods=3050 --strategy=speed --days=3 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=110 --min_periods=3050 --strategy=speed --days=3 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=111 --min_periods=3050 --strategy=speed --days=3 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=112 --min_periods=3050 --strategy=speed --days=3 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=113 --min_periods=3050 --strategy=speed --days=3 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=114 --min_periods=3050 --strategy=speed --days=3 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=115 --min_periods=3050 --strategy=speed --days=3 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=116 --min_periods=3050 --strategy=speed --days=3 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=117 --min_periods=3050 --strategy=speed --days=3 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=118 --min_periods=3050 --strategy=speed --days=3 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=119 --min_periods=3050 --strategy=speed --days=3 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=120 --min_periods=3050 --strategy=speed --days=3 gdax.BTC-USD
        break
    fi
    date
    echo "Press b for BTC, e for ETH, l for LTC"
    read -t 1 -n 1 key
    if [[ $key = e ]]
    then	
sudo ./zenbot.sh sim --period=100ms --meas=100 --min_periods=3050 --strategy=speed --days=3 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=200 --min_periods=3050 --strategy=speed --days=3 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=300 --min_periods=3050 --strategy=speed --days=3 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=400 --min_periods=3050 --strategy=speed --days=3 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=500 --min_periods=3050 --strategy=speed --days=3 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=600 --min_periods=3050 --strategy=speed --days=3 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=700 --min_periods=3050 --strategy=speed --days=3 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=800 --min_periods=3050 --strategy=speed --days=3 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=900 --min_periods=3050 --strategy=speed --days=3 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=1000 --min_periods=3050 --strategy=speed --days=3 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=1100 --min_periods=3050 --strategy=speed --days=3 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=1200 --min_periods=3050 --strategy=speed --days=3 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=1300 --min_periods=3050 --strategy=speed --days=3 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=1400 --min_periods=3050 --strategy=speed --days=3 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=1500 --min_periods=3050 --strategy=speed --days=3 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=1600 --min_periods=3050 --strategy=speed --days=3 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=1700 --min_periods=3050 --strategy=speed --days=3 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=1800 --min_periods=3050 --strategy=speed --days=3 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=1900 --min_periods=3050 --strategy=speed --days=3 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=2000 --min_periods=3050 --strategy=speed --days=3 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=2100 --min_periods=3050 --strategy=speed --days=3 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=2200 --min_periods=3050 --strategy=speed --days=3 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=2300 --min_periods=3050 --strategy=speed --days=3 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=2400 --min_periods=3050 --strategy=speed --days=3 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=2500 --min_periods=3050 --strategy=speed --days=3 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=2600 --min_periods=3050 --strategy=speed --days=3 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=2700 --min_periods=3050 --strategy=speed --days=3 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=2800 --min_periods=3050 --strategy=speed --days=3 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=2900 --min_periods=3050 --strategy=speed --days=3 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=3000 --min_periods=3050 --strategy=speed --days=3 gdax.ETH-USD
        break
    fi
    date
    echo "Press b for BTC, e for ETH, l for LTC"
    read -t 1 -n 1 key
    if [[ $key = l ]]
    then	
sudo ./zenbot.sh sim --period=100ms --meas=100 --min_periods=3050 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=200 --min_periods=3050 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=300 --min_periods=3050 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=400 --min_periods=3050 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=500 --min_periods=3050 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=600 --min_periods=3050 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=700 --min_periods=3050 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=800 --min_periods=3050 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=900 --min_periods=3050 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=1000 --min_periods=3050 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=1100 --min_periods=3050 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=1200 --min_periods=3050 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=1300 --min_periods=3050 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=1400 --min_periods=3050 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=1500 --min_periods=3050 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=1600 --min_periods=3050 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=1700 --min_periods=3050 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=1800 --min_periods=3050 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=1900 --min_periods=3050 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=2000 --min_periods=3050 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=2100 --min_periods=3050 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=2200 --min_periods=3050 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=2300 --min_periods=3050 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=2400 --min_periods=3050 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=2500 --min_periods=3050 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=2600 --min_periods=3050 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=2700 --min_periods=3050 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=2800 --min_periods=3050 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=2900 --min_periods=3050 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=3000 --min_periods=3050 --strategy=speed --days=0.1 gdax.LTC-USD
        break
    fi
done
