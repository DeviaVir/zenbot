import json
import requests
import re
import unicodedata
import subprocess
from subprocess import PIPE,call,STDOUT
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
			args2 = ' --days=1 --currency_capital=5 --period=5m --strategy=trend_ema'
			args3 = ' --days=1 --currency_capital=5 --period=10m --strategy=trend_ema'
			args4 = ' --days=1 --currency_capital=5 --period=15m --strategy=trend_ema'
			args5 = ' --days=1 --currency_capital=5 --period=20m --strategy=trend_ema'
			args6 = ' --days=1 --currency_capital=5 --period=25m --strategy=trend_ema'
			args7 = ' --days=1 --currency_capital=5 --period=30m --strategy=trend_ema'
			#args8 = ' --days=1 --currency_capital=5 --period=30m --strategy=macd'
			#args9 = ' --days=1 --currency_capital=5 --period=50m --strategy=macd'
			#args10 = ' --days=1 --currency_capital=5 --period=60m --strategy=macd'
			#args11 = ' --days=1 --currency_capital=5 --period=70m --strategy=macd'
			#args12 = ' --days=1 --currency_capital=5 --period=90m --strategy=macd'
			#args13 = ' --days=1 --currency_capital=5 --period=5m --strategy=rsi'
			#args14 = ' --days=1 --currency_capital=5 --period=10m --strategy=rsi'
			#args15 = ' --days=1 --currency_capital=5 --period=2m --strategy=rsi'
			#args16 = ' --days=1 --currency_capital=5 --period=20m --strategy=rsi'
			#args17 = ' --days=1 --currency_capital=5 --period=30m --strategy=rsi'
			#args18 = ' --days=1 --currency_capital=5 --period=2m --strategy=sar'
			#args19 = ' --days=1 --currency_capital=5 --period=10m --strategy=sar'
			#args20 = ' --days=1 --currency_capital=5 --period=15m --strategy=sar'
			#args21 = ' --days=1 --currency_capital=5 --period=25m --strategy=sar'
			#args22 = ' --days=1 --currency_capital=5 --period=30m --strategy=sar'
			#args23 = ' --days=1 --currency_capital=5 --period=1m --strategy=speed'
			#args24 = ' --days=1 --currency_capital=5 --period=1m --strategy=speed'
			#args25 = ' --days=1 --currency_capital=5 --period=5m --strategy=speed'
			#args26 = ' --days=1 --currency_capital=5 --period=10m --strategy=speed'
			#args27 = ' --days=1 --currency_capital=5 --period=20m --strategy=rsi_macd'
			#args28 = ' --days=1 --currency_capital=5 --period=25m --strategy=rsi_macd'
			#args29 = ' --days=1 --currency_capital=5 --period=30m --strategy=rsi_macd'
			#args30 = ' --days=1 --currency_capital=5 --period=35m --strategy=rsi_macd'
			#args31 = ' --days=1 --currency_capital=5 --period=40m --strategy=rsi_macd'
			#args32 = ' --days=1 --currency_capital=5 --period=10m --strategy=cci_srsi'
			#args33 = ' --days=1 --currency_capital=5 --period=15m --strategy=cci_srsi'
			#args34 = ' --days=1 --currency_capital=5 --period=20m --strategy=cci_srsi'
			#args35 = ' --days=1 --currency_capital=5 --period=25m --strategy=cci_srsi'
			#args36 = ' --days=1 --currency_capital=5 --period=30m --strategy=cci_srsi'
			#args37 = ' --days=1 --currency_capital=5 --period=20m --strategy=srsi_macd'
			#args38 = ' --days=1 -currency_capital=5 --period=25m --strategy=srsi_macd'
			#args39 = ' --days=1 --currency_capital=5 --period=30m --strategy=srsi_macd'
			#args40 = ' --days=1 --currency_capital=5 --period=35m --strategy=srsi_macd'
			#args41 = ' --days=1 --currency_capital=5 --period=40m --strategy=srsi_macd'
			process1 = 'zenbot backfill poloniex.' +ke9 +args1
			process2 = './backtester.js poloniex.' +ke9 +args2
			process3 = './backtester.js poloniex.' +ke9 +args3
			process4 = './backtester.js poloniex.' +ke9 +args4
			process5 = './backtester.js poloniex.' +ke9 +args5
			process6 = './backtester.js poloniex.' +ke9 +args6
			process7 = './backtester.js poloniex.' +ke9 +args7
			#process8 = './backtester.js poloniex.' +ke9 +args8
			#process9 = './backtester.js poloniex.' +ke9 +args9
			#process10 = './backtester.js poloniex.' +ke9 +args10
			#process11 = './backtester.js poloniex.' +ke9 +args11
			#process12 = './backtester.js poloniex.' +ke9 +args12
			#process13 = './backtester.js poloniex.' +ke9 +args13
			#process14 = './backtester.js poloniex.' +ke9 +args14
			#process15 = './backtester.js poloniex.' +ke9 +args15
			#process16 = './backtester.js poloniex.' +ke9 +args16
			#process17 = './backtester.js poloniex.' +ke9 +args17
			#process18 = './backtester.js poloniex.' +ke9 +args18
			#process19 = './backtester.js poloniex.' +ke9 +args19
			#process20 = './backtester.js poloniex.' +ke9 +args20
			#process21 = './backtester.js poloniex.' +ke9 +args21
			#process22 = './backtester.js poloniex.' +ke9 +args22
			#process23 = './backtester.js poloniex.' +ke9 +args23
			#process24 = './backtester.js poloniex.' +ke9 +args24
			#process25 = './backtester.js poloniex.' +ke9 +args25
			#process26 = './backtester.js poloniex.' +ke9 +args26
			#process27 = './backtester.js poloniex.' +ke9 +args27
			#process28 = './backtester.js poloniex.' +ke9 +args28
			#process29 = './backtester.js poloniex.' +ke9 +args29
			#process30 = './backtester.js poloniex.' +ke9 +args30
			#process31 = './backtester.js poloniex.' +ke9 +args31
			#process32 = './backtester.js poloniex.' +ke9 +args32
			#process33 = './backtester.js poloniex.' +ke9 +args33
			#process34 = './backtester.js poloniex.' +ke9 +args34
			#process35 = './backtester.js poloniex.' +ke9 +args35
			#process36 = './backtester.js poloniex.' +ke9 +args36
			#process37 = './backtester.js poloniex.' +ke9 +args37
			#process38 = './backtester.js poloniex.' +ke9 +args38
			#process39 = './backtester.js poloniex.' +ke9 +args39
			#process40 = './backtester.js poloniex.' +ke9 +args40
			#process41 = './backtester.js poloniex.' +ke9 +args41
			print(process1)
			subprocess.call(process1,shell=True)
			print(process2)
			subprocess.call(process2,shell=True)
			print(process3)
			subprocess.call(process3,shell=True)
			print(process4)
			subprocess.call(process4,shell=True)
			print(process5)
			subprocess.call(process5,shell=True)
			print(process6)
			subprocess.Popen(process6,shell=True)
			print(process7)
			subprocess.Popen(process7,shell=True)
			#print(process8)
			#subprocess.call(process8,shell=True)
			#print(process9)
			#subprocess.call(process9,shell=True)
			#print(process10)
			#subprocess.call(process10,shell=True)
			#print(process11)
			#subprocess.call(process11,shell=True)
			#print(process12)
			#subprocess.call(process12,shell=True)
			#print(process13)
			#subprocess.call(process13,shell=True)
			#print(process14)
			#subprocess.call(process14,shell=True)
			#print(process15)
			#subprocess.call(process15,shell=True)
			#print(process16)
			#subprocess.call(process16,shell=True)
			##print(process17)
			#subprocess.call(process17,shell=True)
			#print(process18)
			#subprocess.call(process18,shell=True)
			#print(process19)
			#subprocess.call(process19,shell=True)
			#print(process20)
			#subprocess.call(process20,shell=True)
			#print(process21)
			#subprocess.call(process21,shell=True)
			#print(process22)
			#subprocess.call(process22,shell=True)
			#print(process23)
			#subprocess.Popen(process23,shell=True)
			#print(process24)
			#subprocess.call(process24,shell=True)
			#print(process25)
			#subprocess.call(process25,shell=True)
			#print(process26)
			#subprocess.call(process26,shell=True)
			#print(process27)
			#subprocess.call(process27,shell=True)
			#print(process28)
			#subprocess.call(process28,shell=True)
			#print(process29)
			#subprocess.call(process29,shell=True)
			#print(process30)
			#subprocess.call(process30,shell=True)
			#print(process31)
			#subprocess.call(process31,shell=True)
			#print(process32)
			#subprocess.call(process32,shell=True)
			#print(process33)
			#subprocess.call(process33,shell=True)
			#print(process34)
			#subprocess.call(process34,shell=True)
			#print(process35)
			#subprocess.call(process35,shell=True)
			#print(process36)
			#subprocess.call(process36,shell=True)
			#print(process37)
			#subprocess.call(process37,shell=True)
			#print(process38)
			#subprocess.call(process38,shell=True)
			#print(process39)
			#subprocess.call(process39,shell=True)
			#print(process40)
			#subprocess.call(process40,shell=True)
			#print(process41)
			#subprocess.call(process41,shell=True)
	return
tester()