import random

# zenbot dir, ex. "/app/zenbot" for docker "/full/path/of/zenbot/dir" for linux envinronment
path = '/home/gecko/zenbot'
# name of python executable
pyexc = 'python3.6'
# Autobackfill interval in seconds, min 600 secs -> 10 mins
bkfint = 30
selectors = {
    'BTC-CUR': ['gdax.BTC-USD', 'gdax.BTC-EUR', 'gdax.BTC-GBP'],
    'ETH-BTC': ['gdax.ETH-BTC'],
    'ETH-EUR': ['gdax.ETH-EUR'],
    'ETH-USD': ['gdax.ETH-USD'],
    'ETH-CUR': ['gdax.ETH-USD','gdax.ETH-EUR'],
}
partitions=2
selectivity = 0.3

runid=random.randint(1000,9999)
sigma = 20
indpb  = 0.3
mutpb = 0.3
cxpb = 0.3
