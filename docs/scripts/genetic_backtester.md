# Genetic Backtester - Darwin

The Genetic Backtester will execute a range of simulations with a range of parameters, limited by the population size, per strategy. Once all sims in the population are complete, the top results are taken as the starting point for the next generation. This continues indefinitely, until interrupted by the user, or --runGenerations is reached.

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
./scripts/genetic_backtester/darwin.js --selector="bitfinex.ETH-USD" --days="10" --currency_capital="1000" --use_strategies="all | macd,trend_ema,etc" --population="101" --population_data="simulations/generation_data_[simtimestamp]_gen_[x].json"
```

## Parameters

The following parameters are available when executing darwin.js:
```

// General Parameters
--selector="gdax.BTC-USD"                                                               # Which selector (exchange.COIN-ALT) backfill trade data the backtest is to be run against.
--days="30"                                                                             # How many days of backfill to run the backtest against.
(or)
--start="201712010001"                                                                  # Specifies date/time in "YYYYMMDDhhmm" format at which to begin backtesting in liu of --days. Backtest will begin with start date through backtest execution time.
--end="201712312359"                                                                    # Optional - Used in conjunction with --start in order to restrict backtesting to a specific period instead of from start -> now.
--currency_capital="1000"                                                               # Currency amount to start simulations with. Needs to be bigger than 0 (see issue #449).
(or)
--asset_capital="100"                                                                   # Optional - Asset amount to start simulations with.

// Specific Parameters
--use_strategies="all | strategy1,strategy2"                                            # With this parameter, you can choose to test all, some (comma separated), or just one of the available strategies defined within darwin.
--population="150"                                                                      # Optional - Number of simulation per generation
--population_data="./simulations/backtest_[simtimestamp]"                               # Optional - Resume backtesting on a previously terminated backtesting session.
--runGenerations									# Optional - Makes it possible to stop after a number of generations
```

## Results

When the next generation starts testing, a csv file will appear in the simulations folder. This CSV contains all simulations that were executed in that generation, including the parameters and results.

The top results are listed at the top of the file, in descending order.

## Further Customization

The default ranges can be further customized per strategy by editing the [darwin.js](blob/master/scripts/genetic_backtester/darwin.js) script.
