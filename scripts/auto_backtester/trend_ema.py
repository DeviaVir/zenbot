import json
import requests
import re
import unicodedata
import subprocess
from subprocess import PIPE,Popen,STDOUT
import os
import sqlite3
import time
from decimal import *
import threading
def tester():
	##Main App Loop
	##DB Refresh
	print('Starting Main Loop - getting coins')
	wjdata = requests.get('https://poloniex.com/public?command=returnTicker&period=60').json()
	##Load Initial Data
	for key in wjdata:
		if re.match(r'BTC_+', key):
			ke1=key.replace('_', '-')
			ke2=ke1.replace('BTC-', '')
			ke3='-BTC'
			ke9=ke2+ke3
			print('New coin:' + ke9)
			print('Started backtesting:' + ke9)
			args1 = ' --days=30'
			args2 = ' --days=7 --currency_capital=5 --period=5m --strategy=trend_ema'
			args3 = ' --days=7 --currency_capital=5 --period=10m --strategy=trend_ema'
			args4 = ' --days=7 --currency_capital=5 --period=15m --strategy=trend_ema'
			args5 = ' --days=7 --currency_capital=5 --period=20m --strategy=trend_ema'
			args6 = ' --days=7 --currency_capital=5 --period=25m --strategy=trend_ema'
			args7 = ' --days=7 --currency_capital=5 --period=30m --strategy=trend_ema'
			args8 = ' --days=7 --currency_capital=5 --period=35m --strategy=trend_ema'
			args9 = ' --days=7 --currency_capital=5 --period=40m --strategy=trend_ema'
			args10 = ' --days=7 --currency_capital=5 --period=45m --strategy=trend_ema'
			args11 = ' --days=7 --currency_capital=5 --period=50m --strategy=trend_ema'
			args12 = ' --days=7 --currency_capital=5 --period=55m --strategy=trend_ema'
			args13 = ' --days=7 --currency_capital=5 --period=60m --strategy=trend_ema'
			process1 = 'zenbot backfill poloniex.' +ke9 +args1
			#process2 = './backtester1.js poloniex.' +ke9 +args2
			process3 = './backtester.js poloniex.' +ke9 +args3
			process4 = './backtester.js poloniex.' +ke9 +args4
			process5 = './backtester.js poloniex.' +ke9 +args5
			process6 = './backtester.js poloniex.' +ke9 +args6
			process7 = './backtester.js poloniex.' +ke9 +args7
			process8 = './backtester.js poloniex.' +ke9 +args8
			process9 = './backtester.js poloniex.' +ke9 +args9
			process10 = './backtester.js poloniex.' +ke9 +args10
			process11 = './backtester.js poloniex.' +ke9 +args11
			process12 = './backtester.js poloniex.' +ke9 +args12
			process13 = './backtester.js poloniex.' +ke9 +args13
			print(process1)
			subprocess.call(process1,shell=True)
			#print(process2)
			#subprocess.call(process2,shell=True)
			print(process3)
			subprocess.call(process3,shell=True)
			print(process4)
			subprocess.call(process4,shell=True)
			print(process5)
			subprocess.call(process5,shell=True)
			print(process6)
			subprocess.call(process6,shell=True)
			print(process7)
			subprocess.call(process7,shell=True)
			print(process8)
			subprocess.call(process8,shell=True)
			print(process9)
			subprocess.call(process9,shell=True)
			print(process10)
			subprocess.call(process10,shell=True)
			print(process11)
			subprocess.call(process11,shell=True)
			print(process12)
			subprocess.call(process12,shell=True)
			print(process13)
			subprocess.call(process13,shell=True)
	return
tester()