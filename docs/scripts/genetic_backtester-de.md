# Genetic Backtester - Darwin

Der Genetic Backtester führt pro Strategie eine Reihe von Simulationen mit einer Reihe von Parametern durch, die durch die Populationsgröße begrenzt sind. 
Sobald alle Sims in der Population vollständig sind, werden die besten Ergebnisse als Ausgangspunkt für die nächste Generation verwendet. 
Dies wird auf unbestimmte Zeit fortgesetzt, bis der Benutzer ihn unterbricht oder '--runGenerations' erreicht wird.


## Installation

Dieses Skript enthält zusätzliche Knotenabhängigkeiten, die vor der Verwendung installiert werden müssen: 

```bash
cd scripts/genetic_backtester
npm install
cd ../../
```

## Verwendung

Starten Sie den genetischen Backtester von der Zenbot-Wurzel aus, indem Sie direkt darwin.js aufrufen:
```bash
./scripts/genetic_backtester/darwin.js --selector="bitfinex.ETH-USD" --days="10" --currency_capital="1000" --use_strategies="all | macd,trend_ema,etc" --population="101" --population_data="simulations/generation_data_[simtimestamp]_gen_[x].json"
```

## Parameter

Die folgenden Parameter sind verfügbar, wenn darwin.js ausgeführt wird: 
```

// Allgemeine Parameter
--selector="gdax.BTC-USD"                                           # Welcher Selektor (exchange.COIN-ALT) füllt Handelsdaten aus, gegen die der Backtest ausgeführt werden soll.
--days="30"                                                         # Wie viele Tage auffüllen, um den Backtest erneut durchzuführen.
(oder)
--start="201712010001"                                              # Gibt Datum/Uhrzeit im Format "JJJJMMTThhmm" an, bei dem mit dem Backtesting in liu von --days Tagen begonnen werden soll. Der Backtest beginnt mit dem Startdatum bis zur Endausführungszeit des Backtests.
--end="201712312359"                                                # Optional - Wird in Verbindung mit '--start' verwendet, um das Backtesting auf einen bestimmten Zeitraum anstatt von Anfang an zu beschränken -> jetzt.
--currency_capital="1000"                                           # Währungsbetrag, mit die Simulation gestartet werden sollen. Muss größer als 0 sein (siehe Ausgabe Nr. 449). 
(oder)
--asset_capital="100"                                               # Optional - Vermögenswert-Betrag, mit dem Simulationen gestartet werden sollen.

// Spezifische Parameter
--use_strategies="all | strategy1,strategy2"                        # Mit diesem Parameter können Sie auswählen, ob Sie alle, einige (durch Kommas getrennt) oder nur eine der verfügbaren Strategien testen möchten, die in Darwin definiert sind.
--population="150"                                                  # Optional - Anzahl der Simulationen pro Generation.
--population_data="./simulations/backtest_[simtimestamp]"           # Optional - Setzen Sie das Backtesting in einer zuvor beendeten Backtesting-Sitzung fort. 
--runGenerations													# Optional - Ermöglicht das Stoppen nach mehreren Generationen. 
```

## Ergebnisse

Wenn die nächste Generation mit dem Testen beginnt, wird eine CSV-Datei im Simulationsordner angezeigt. Diese CSV enthält alle Simulationen, die in dieser Generation ausgeführt wurden, einschließlich der Parameter und Ergebnisse. 

Die Top-Ergebnisse werden oben in der Datei in absteigender Reihenfolge aufgelistet. 

## Weitere Anpassung

Die Standardbereiche können durch Bearbeiten des Skripts [darwin.js] (blob/master/scripts/genetic_backtester/darwin.js) pro Strategie weiter angepasst werden.
