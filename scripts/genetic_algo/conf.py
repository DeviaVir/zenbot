import random


selectors = {
    'BTC-CUR': ['gdax.BTC-USD', 'gdax.BTC-EUR', 'gdax.BTC-GBP'],
    'ETH-BTC': ['gdax.ETH-BTC'],
    'ETH-EUR': ['gdax.ETH-EUR'],
    'ETH-USD': ['gdax.ETH-USD'],
    'ETH-CUR': ['gdax.ETH-USD', 'gdax.ETH-EUR'],
}
partitions = 2
selectivity = 0.3

runid = random.randint(1000, 9999)
sigma = 20
indpb = 0.3
mutpb = 0.3
cxpb = 0.3
