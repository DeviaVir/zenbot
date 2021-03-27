### Die `trend_ema`-Strategie

- Die Standardstrategie heißt "trend_ema" und befindet sich unter ". /Extensions/strategies/trend_ema".
- Standardmäßig wird ein Zeitraum von 2 m verwendet. Sie können dies jedoch überschreiben, indem Sie z.B. `--period=5m` zu den Befehlen `sim` oder `trade`.
- Berechnet die 26-Perioden-EMA des aktuellen Preises und berechnet die prozentuale Änderung gegenüber der EMA der letzten Periode, um die `trend_ema_rate` zu erhalten.
- Betrachtet `trend_ema_rate>= 0` als Aufwärtstrend und` trend_ema_rate < 0` als Abwärtstrend.
- Filtert niedrige Werte (Peitschensägen) nach "neutral_rate" heraus, wobei bei Einstellung auf "auto" die Standardabweichung der `trend_ema_rate` als variabler Rauschfilter verwendet wird.
- Kauft zu Beginn des Aufwärtstrends, verkauft zu Beginn des Abwärtstrends.
- Wenn "Oversold_rsi" gesetzt ist, wird versucht zu kaufen, wenn der RSI unter diesen Wert fällt, und beginnt sich dann zu erholen (ein Gegenstück zu `--profit_stop_enable_pct"`, das verkauft, wenn ein Prozent des Gewinns erreicht ist, und dann sinkt)
- Der Bot wird immer versuchen, Handelsgebühren zu vermeiden, indem er Post-Only-Bestellungen verwendet und somit ein Market "Maker" anstelle eines "Taker" ist. Einige Börsen bieten jedoch keine Herstellerrabatte an.
