# Genetic Backtester - Darwin

The Genetic Backtester will execute a range of simulations with a range of parameters, limited by the population size, per strategy. Once all sims in the population are complete, the top results are taken as the starting point for the next generation. This continues indefinitely, until interrupted by the user.

## Installation

This script has additional node dependencies that need to be installed before usage:

```bash
cd scripts/genetic_backtester
npm install
cd ../../
```

## Usage

Launch the genetic backtester from the zenbot root by directly invoking darwin.js:
```bash
  ./scripts/genetic_backtester/darwin.js --days=30 --asset_capital=0 --currency_capital=1000 --selector="gdax.BTC-USD" --population=150 --use_strategies="macd,trend_ema"
```

## Parameters

The following parameters are available when executing darwin.js:
```
// Primary Parameters
--use_strategies="strategyname"                                                         # comma separated strategy list to test with. Leave blank to test all.
--population_data=./simulations/generation_data_1514280516_gen_582.json                 # (optional) continue backtesting from a specific generation
--population=150                                                                        # (optional) number of simulation per generation

// General Parameters
--selector="gdax.BTC-USD"                                                               # selector to run simulations on
--days=30                                                                               # how many days to execute per simulation
--currency_capital=1000                                                                 # currency amount to start simulations with. Needs to be bigger than 0 (see issue #449).
--asset_capital=0                                                                       # (optional) asset amount to start simulations with.

```

## Results

When the next generation starts testing, a csv file will appear in the simulations folder. This CSV contains all simulations that were executed in that generation, including the parameters and results. 

The top results are listed at the top of the file, in descending order.

## Further Customization

The default ranges can be further customized per strategy by editing the [darwin.js](blob/master/scripts/genetic_backtester/darwin.js) script.