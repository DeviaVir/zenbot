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
sudo ./zenbot.sh sim --period=100ms --meas=10 --min_periods=250 --strategy=speed --days=0.1 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=20 --min_periods=250 --strategy=speed --days=0.1 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=30 --min_periods=250 --strategy=speed --days=0.1 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=40 --min_periods=250 --strategy=speed --days=0.1 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=50 --min_periods=250 --strategy=speed --days=0.1 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=60 --min_periods=250 --strategy=speed --days=0.1 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=70 --min_periods=250 --strategy=speed --days=0.1 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=80 --min_periods=250 --strategy=speed --days=0.1 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=90 --min_periods=250 --strategy=speed --days=0.1 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=100 --min_periods=250 --strategy=speed --days=0.1 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=110 --min_periods=250 --strategy=speed --days=0.1 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=120 --min_periods=250 --strategy=speed --days=0.1 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=130 --min_periods=250 --strategy=speed --days=0.1 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=140 --min_periods=250 --strategy=speed --days=0.1 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=150 --min_periods=250 --strategy=speed --days=0.1 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=160 --min_periods=250 --strategy=speed --days=0.1 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=170 --min_periods=250 --strategy=speed --days=0.1 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=180 --min_periods=250 --strategy=speed --days=0.1 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=190 --min_periods=250 --strategy=speed --days=0.1 gdax.BTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=200 --min_periods=250 --strategy=speed --days=0.1 gdax.BTC-USD
        break
    fi
    date
    echo "Press b for BTC, e for ETH, l for LTC"
    read -t 1 -n 1 key
    if [[ $key = e ]]
    then	
sudo ./zenbot.sh sim --period=100ms --meas=10 --min_periods=250 --strategy=speed --days=0.1 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=20 --min_periods=250 --strategy=speed --days=0.1 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=30 --min_periods=250 --strategy=speed --days=0.1 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=40 --min_periods=250 --strategy=speed --days=0.1 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=50 --min_periods=250 --strategy=speed --days=0.1 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=60 --min_periods=250 --strategy=speed --days=0.1 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=70 --min_periods=250 --strategy=speed --days=0.1 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=80 --min_periods=250 --strategy=speed --days=0.1 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=90 --min_periods=250 --strategy=speed --days=0.1 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=100 --min_periods=250 --strategy=speed --days=0.1 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=110 --min_periods=250 --strategy=speed --days=0.1 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=120 --min_periods=250 --strategy=speed --days=0.1 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=130 --min_periods=250 --strategy=speed --days=0.1 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=140 --min_periods=250 --strategy=speed --days=0.1 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=150 --min_periods=250 --strategy=speed --days=0.1 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=160 --min_periods=250 --strategy=speed --days=0.1 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=170 --min_periods=250 --strategy=speed --days=0.1 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=180 --min_periods=250 --strategy=speed --days=0.1 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=190 --min_periods=250 --strategy=speed --days=0.1 gdax.ETH-USD
sudo ./zenbot.sh sim --period=100ms --meas=200 --min_periods=250 --strategy=speed --days=0.1 gdax.ETH-USD
        break
    fi
    date
    echo "Press b for BTC, e for ETH, l for LTC"
    read -t 1 -n 1 key
    if [[ $key = l ]]
    then	
sudo ./zenbot.sh sim --period=100ms --meas=10 --min_periods=250 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=20 --min_periods=250 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=30 --min_periods=250 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=40 --min_periods=250 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=50 --min_periods=250 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=60 --min_periods=250 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=70 --min_periods=250 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=80 --min_periods=250 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=90 --min_periods=250 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=100 --min_periods=250 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=110 --min_periods=250 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=120 --min_periods=250 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=130 --min_periods=250 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=140 --min_periods=250 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=150 --min_periods=250 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=160 --min_periods=250 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=170 --min_periods=250 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=180 --min_periods=250 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=190 --min_periods=250 --strategy=speed --days=0.1 gdax.LTC-USD
sudo ./zenbot.sh sim --period=100ms --meas=200 --min_periods=250 --strategy=speed --days=0.1 gdax.LTC-USD
        break
    fi
done
