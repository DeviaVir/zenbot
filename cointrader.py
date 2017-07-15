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
variable = []
flag = []
class same(object):
	def __init__(self):
			global variable
			global flag
			variable=str(variable)
			variablestr=str(variable)
			print('Starting Trade Of:' + variablestr)
			process='./zenbot.sh trade --order_adjust_time=30000 --debug  poloniex.' + variablestr
			subprocess.call(process,shell=True)
			('Done Trading')
class diff(object):
	def __init__(self):
			global variable
			global flag
			flagstr = str(flag)
			print('Started Selling:' + flagstr)
			process = './zenbot.sh sell --order_adjust_time=30000 --debug  poloniex.' + flagstr
			p = subprocess.Popen(process,stdout=subprocess.PIPE,shell=True)
			for line in p.stdout:
				print line
			p.wait()
			print p.returncode
class firstFunction(object):
	def __init__(self):
		while 1:
		##Main App Loop
		##DB Refresh
			global variable
			global flag
			os.remove('/example.db')
			conn = sqlite3.connect('/example.db')
			c = conn.cursor()
			c.execute('''CREATE TABLE gains (ke4,pct1,dips,dips1)''')
			print('Starting Main Loop')
			wjdata = requests.get('https://poloniex.com/public?command=returnTicker&period=60').json()
			##Load Initial Data
			for key in wjdata:
				if re.match(r'BTC_+', key):
					ke1=key.replace('_', '-')
					ke2=ke1.replace('BTC-', '')
					ke3='-BTC'
					ke9=ke2+ke3
					pct=(wjdata[key]['last'])
					pct0=Decimal(pct)
					pct1=format(pct0, 'f')
					dips='undefined'
					dips1='undefined'
					c.execute("INSERT INTO gains VALUES (?, ?, ?, ?);", (ke9, pct1, dips, dips1))
					conn.commit()
			time.sleep(1200)
			wjdata = requests.get('https://poloniex.com/public?command=returnTicker&period=60').json()
			##Load the second Data
			for key in wjdata:
				if re.match(r'BTC_+', key):
					ke1=key.replace('_', '-')
					ke2=ke1.replace('BTC-', '')
					ke3='-BTC'
					ke4=ke2+ke3
					pct2=(wjdata[key]['last'])
					pct3=Decimal(pct2)
					dips=format(pct3, 'f')
					c.execute('UPDATE gains SET dips = ? WHERE ke4 = ?;', (dips, ke4))
					conn.commit()
			for row in c.execute('SELECT ke4, (dips-pct1) as diff FROM gains ORDER BY diff DESC LIMIT 1;'):
					row=str(tuple(row))
					ro1=row.replace("u", '')
					ro2=ro1.replace("'", '')
					ro3=ro2.replace('(', '')
					ro4=ro3.replace(')', '')
					ro5=ro4.replace(",", '')
					s = ro5
					s=re.sub('\d', '', s)
					variable=s.replace(".", '')
					print('New coin:' + variable)
					time.sleep(15)
					flag=variable
					
					
class sync(object):
	def __init__(self):
		while 1:
				global variable
				global flag
				if flag == variable:
					time.sleep(3)
				else:
					time.sleep(5)
					subprocess.call('sudo killall node',shell=True)
					time.sleep(5)
					threading.Thread(target=diff).start()
					time.sleep(5)
					threading.Thread(target=same).start()

def main():
	d = threading.Thread(target=firstFunction)
	d.start()
	e = threading.Thread(target=sync)
	e.daemon = True
	e.start()
main()