dema ist letzte
```
Zenbot-Listenstrategien

bollinger
  Beschreibung:
    Kaufen Sie wenn (Signal ≤ unteres Bollinger-Band) und verkaufen Sie wann (Signal ≥ oberes Bollinger-Band).
  Optionen:
    --period=<Wert> Periodenlänge, wie --period_length (Standard: 1h).
    --period_length=<Wert> Periodenlänge, wie --period (Standard: 1h).
    --min_periods=<Wert> min. Anzahl der Verlaufsperioden (Standard: 52).
    --bollinger_size=<Wert> Periodengröße (Standard: 20).
    --bollinger_time=<Wert> Zeiten der Standardabweichung zwischen dem oberen Band und den gleitenden Durchschnitten (Standard: 2).
    --bollinger_upper_bound_pct=<Wert> pct Der aktuelle Preis sollte sich vor dem Verkauf in der Nähe der Bollinger-Obergrenze befinden (Standard: 0).
    --bollinger_lower_bound_pct=<Wert> pct Der aktuelle Preis sollte sich vor dem Verkauf in der Nähe der Bollinger-Obergrenze befinden (Standard: 0).

cci_srsi
  Beschreibung:
    Stochastische CCI-Strategie
  Optionen:
    --period=<Wert> Periodenlänge, wie --period_length (Standard: 20 m)
    --period_length=<Wert> Periodenlänge, wie --period (Standard: 20 m)
    --min_periods=<Wert> min. Anzahl der Verlaufsperioden (Standard: 30)
    --ema_acc=<Wert> seitlicher Schwellenwert (0,2-0,4) (Standard: 0,03)
    --cci_periods=<Wert> Anzahl der RSI-Perioden (Standard: 14)
    --rsi_periods=<Wert> Anzahl der RSI-Perioden (Standard: 14)
    --srsi_periods=<Wert> Anzahl der RSI-Perioden (Standard: 9)
    --srsi_k=<Wert>  %K Zeile (Standard: 5)
    --srsi_d=<Wert>  %D Zeile (Standard: 3)
    --oversold_rsi=<Wert> kaufen, wenn der RSI diesen Wert erreicht oder unterschreitet (Standard: 18)
    --overbought_rsi=<Wert> verkaufen, wenn der RSI diesen Wert erreicht oder überschreitet (Standard: 85)
    --oversold_cci=<Wert> kaufen, wenn CCI diesen Wert erreicht oder unterschreitet (Standard: -90)
    --overbought_cci=<Wert> verkaufen, wenn CCI diesen Wert erreicht oder überschreitet (Standard: 140)
    --constant=<Wert> Konstante (Standard: 0.015)
Wenn Sie Fragen zu dieser Strategie haben, kontaktieren Sie mich... @talvasconcelos

crossover_vwap
  Beschreibung:
    Schätzen Sie Trends, indem Sie den "volumengewichteten Durchschnittspreis" mit dem "exponentiellen gleitenden Durchschnitt" vergleichen.
  Optionen:
    --period=<Wert>  Periodenlänge, wie --period_length (Standard: 120 m)
    --period_length=<Wert>  Periodenlänge, wie --period (Standard: 120 m)
    --emalen1=<Wert>  Länge von EMA 1 (Standard: 30)
    --smalen1=<Wert>  Länge von SMA 1 (Standard: 108)
    --smalen2=<Wert>  Länge von SMA 2 (Standard: 60)
    --vwap_length=<Wert>  Mindestdauer für den Start von vwap (Standard: 10)
    --vwap_max=<Wert>  Maximaler Verlauf für vwap. Wenn Sie dies erhöhen, wird es empfindlicher für kurzfristige Änderungen (Standard: 8000).

dema
  Beschreibung:
    Kaufen Sie wenn (short ema > long ema) und verkaufen Sie wenn (short ema < long ema).
  Optionen:
    --period=<Wert>  Periodenlänge (Standard: 1h)
    --min_periods=<Wert>  min. Anzahl der Verlaufsperioden (Standard: 21)
    --ema_short_period=<Wert>  Anzahl der Perioden für die kürzere EMA (Standard: 10)
    --ema_long_period=<Wert>  Anzahl der Perioden für die längere EMA (Standard: 21)
    --up_trend_threshold=<Wert>  Schwelle zum Auslösen eines Kaufsignals (Standard: 0)
    --down_trend_threshold=<Wert>  Schwelle zum Auslösen eines verkauften Signals (Standard: 0)
    --overbought_rsi_periods=<Wert>   Anzahl der Perioden für überkauften RSI (Standard: 9)
    --overbought_rsi=<Wert>  verkauft, wenn RSI diesen Wert überschreitet (Standard: 80)
    --noise_level_pct=<Wert>  nicht handeln, wenn Short Ema mit diesem% des letzten Short Ema ist, 0 deaktiviert diese Funktion (Standard: 0)

macd
  Beschreibung:
    Kaufen Sie wann (MACD - Signal> 0) und verkaufen Sie wann (MACD - Signal <0).
  Optionen:
    --period=<Wert>  Periodenlänge, wie --period_length (Standard: 1h)
    --period_length=<Wert>  Periodenlänge wie --period (Standard: 1h)
    --min_periods=<Wert>  min. Anzahl der Verlaufsperioden (Standard: 52)
    --ema_short_period=<Wert>  Anzahl der Perioden für die kürzere EMA (Standard: 12)
    --ema_long_period=<Wert>  Anzahl der Perioden für die längere EMA (Standard: 26)
    --signal_period=<Wert>  Anzahl der Perioden für das Signal EMA (Standard: 9)
    --up_trend_threshold=<Wert>  Schwelle zum Auslösen eines Kaufsignals (Standard: 0)
    --down_trend_threshold=<Wert>  Schwelle zum Auslösen eines verkauften Signals (Standard: 0)
    --overbought_rsi_periods=<Wert>  Anzahl der Perioden für überkauften RSI (Standard: 25)
    --overbought_rsi=<Wert>  verkauft, wenn RSI diesen Wert überschreitet (Standard: 70)

momentum
  Beschreibung:
    MOM = Schließen (Zeitraum) - Schließen (Länge)
  Optionen:
    --momentum_size=<Wert>  Anzahl der Perioden, in denen auf Momentum zurückgegriffen werden soll (Standard: 5)

neural
  Beschreibung:
    Verwenden Sie neuronales Lernen, um den zukünftigen Preis vorherzusagen. Kaufen = Mittelwert (letzte 3 reale Preise) <Mittelwert (aktuelle und letzte Vorhersage)
  Optionen:
    --period=<Wert>  Periodenlänge - Stellen Sie sicher, dass Sie die Zeit für Ihre Poll-Trades auf diesen Wert senken. Entspricht --period_length (Standard: 1 m)
    --period_length=<Wert>  Periodenlänge - Stellen Sie sicher, dass Sie die Zeit für Ihre Poll-Trades auf diesen Wert senken. Gleich wie --period (Standard: 1m)
    --activation_1_type=<Wert>  Neuronaktivierungstyp: Sigmoid, Tanh, Relu (Standard: Sigmoid)
    --neurons_1=<Wert>  Neuronen in Schicht 1 Schießen Sie auf mindestens 100 (Standard: 1)
    --depth=<Wert>  Datenzeilen, die für Übereinstimmungen / Lernen vorhergesagt werden sollen (Standard: 1)
    --selector=<Wert>  Selector (Standard: Gdax.BTC-USD)
    --min_periods=<Wert>  Zu berechnende Zeiträume lernen aus (Standard: 1000)
    --min_predict=<Wert>  Zeiträume, aus denen die nächste Zahl vorhergesagt werden soll (Standard: 1)
    --momentum=<Wert>  Impuls der Vorhersage (Standard: 0,9)
    --decay=<Wert>  Zerfall der Vorhersage, verwenden Sie winzige Inkremente (Standard: 0.1)
    --threads=<Wert>  Anzahl der Verarbeitungsthreads, die Sie ausführen möchten (am besten für sim) (Standard: 1)
    --learns=<Wert>  Anzahl der Verarbeitungsthreads, die Sie ausführen möchten (am besten für sim) (Standard: 1)

noop
  Beschreibung:
    Tu einfach nichts. Kann verwendet werden, z.B. zum Training für die Strategie.
  Optionen:
    --period=<Wert>  Periodenlänge, wie --period_length (Standard: 30 m)
    --period_length=<Wert>  Periodenlänge wie --period (Standard: 30 m)

rsi
  Beschreibung:
    Versuche, niedrig zu kaufen und hoch zu verkaufen, indem RSI-Hochgrenzwerte verfolgt werden.
  Optionen:
    --period=<Wert>  Periodenlänge, wie --period_length (Standard: 2 m)
    --period_length=<Wert>  Periodenlänge wie --period (Standard: 2 m)
    --min_periods=<Wert>  min. Anzahl der Verlaufsperioden (Standard: 52)
    --rsi_periods=<Wert>  Anzahl der RSI-Perioden
    --oversold_rsi=<Wert>  kaufen, wenn der RSI diesen Wert erreicht oder unterschreitet (Standard: 30)
    --overbought_rsi=<Wert>  verkaufen, wenn der RSI diesen Wert erreicht oder überschreitet (Standard: 82)
    --rsi_recover=<Wert>  ermöglicht RSI, so viele Punkte vor dem Kauf wiederherzustellen (Standard: 3)
    --rsi_drop=<Wert>  ermöglicht es RSI, vor dem Verkauf so viele Punkte zu verlieren (Standard: 0)
    --rsi_divisor=<Wert>  verkaufen, wenn der RSI den Hochwasserwert erreicht, geteilt durch diesen Wert (Standard: 2)

sar
  Beschreibung:
    Parabolische SAR
  Optionen:
    --period=<Wert>  Periodenlänge, wie --period_length (Standard: 2 m)
    --period_length=<Wert>  Periodenlänge wie --period (Standard: 2 m)
    --min_periods=<Wert>  min. Anzahl der Verlaufsperioden (Standard: 52)
    --sar_af=<Wert>  Beschleunigungsfaktor für parabolische SAR (Standard: 0,015)
    --sar_max_af=<Wert>  maximaler Beschleunigungsfaktor für parabolische SAR (Standard: 0,3)

speed
  Beschreibung:
    Handeln Sie, wenn die prozentuale Veränderung gegenüber den letzten beiden 1-Millionen-Perioden über dem Durchschnitt liegt.
  Optionen:
    --period=<Wert>  Periodenlänge, wie --period_length (Standard: 1 m)
    --period_length=<Wert>  Periodenlänge wie --period (Standard: 1 m)
    --min_periods=<Wert>  min. Anzahl der Verlaufsperioden (Standard: 3000)
    --baseline_periods=<Wert>  Lookback-Zeiträume für die Volatilitätsbasislinie (Standard: 3000)
    --trigger_factor=<Wert>  multipliziert mit der Volatilitätsbasislinie EMA, um den Triggerwert zu erhalten (Standard: 1.6)

srsi_macd
  Beschreibung:
    Stochastische MACD-Strategie
  Optionen:
    --period=<Wert>  Periodenlänge, wie --period_length (Standard: 30 m)
    --period_length=<Wert>  Periodenlänge wie --period (Standard: 30 m)
    --min_periods=<Wert>  min. Anzahl der Verlaufsperioden (Standard: 200)
    --rsi_periods=<Wert>  Anzahl der RSI-Perioden
    --srsi_periods=<Wert>  Anzahl der RSI-Perioden (Standard: 9)
    --srsi_k=<Wert>  % D-Zeile (Standard: 5)
    --srsi_d=<Wert>  % D-Zeile (Standard: 3)
    --oversold_rsi=<Wert>  kaufen, wenn der RSI diesen Wert erreicht oder unterschreitet (Standard: 20)
    --overbought_rsi=<Wert>  verkaufen, wenn RSI diesen Wert erreicht oder überschreitet (Standard: 80)
    --ema_short_period=<Wert>  Anzahl der Perioden für die kürzere EMA (Standard: 24)
    --ema_long_period=<Wert>  Anzahl der Perioden für die längere EMA (Standard: 200)
    --signal_period=<Wert>  Anzahl der Perioden für das Signal EMA (Standard: 9)
    --up_trend_threshold=<Wert>  Schwelle zum Auslösen eines Kaufsignals (Standard: 0)
    --down_trend_threshold=<Wert>  Schwelle zum Auslösen eines verkauften Signals (Standard: 0)

stddev
  Beschreibung:
    Kaufen Sie bei Standardabweichung und mittlerem Anstieg, verkaufen Sie bei mittlerer Abnahme.
  Optionen:
    --period=<Wert>  Periodenlänge, setze Poll Trades auf 100ms, Poll Order 1000ms. Gleich wie --period_length (Standard: 100 ms)
    --period_length=<Wert>  Periodenlänge, setze Poll Trades auf 100ms, Poll Order 1000ms. Gleich wie --period (Standard: 100 ms)
    --trendtrades_1=<Wert>  Trades für Array 1, das stddev und Mittelwert von subtrahiert werden soll (Standard: 5)
    --trendtrades_2=<Wert>  Trades für Array 2, das stddev und Mittelwert aus berechnet werden soll (Standard: 53)
    --min_periods=<Wert>  min_periods (Standard: 1250)

ta_ema
  Beschreibung:
    Kaufen Sie wann (EMA - letzte (EMA)> 0) und verkaufen Sie wann (EMA - letzte (EMA) <0). Optionaler Kauf bei niedrigem RSI.
  Optionen:
    --period=<Wert>  Periodenlänge, wie --period_length (Standard: 10 m)
    --period_length=<Wert>  Periodenlänge wie --period (Standard: 10 m)
    --min_periods=<Wert>  min. Anzahl der Verlaufsperioden (Standard: 52)
    --trend_ema=<Wert>  Anzahl der Perioden für Trend-EMA (Standard: 20)
    --neutral_rate=<Wert>  Trades vermeiden, wenn abs (trend_ema) unter diesem Float (0 zum Deaktivieren, "auto" für einen variablen Filter) (Standard: 0.06)
    --oversold_rsi_periods=<Wert>  Anzahl der Perioden für überverkaufte RSI (Standard: 20)
    --oversold_rsi=<Wert>  kaufen, wenn RSI diesen Wert erreicht (Standard: 30)

ta_macd
  Beschreibung:
    Kaufen Sie wann (MACD - Signal> 0) und verkaufen Sie wann (MACD - Signal <0).
  Optionen:
    --period=<Wert>  Periodenlänge, wie --period_length (Standard: 1h)
    --period_length=<Wert>  Periodenlänge wie --period (Standard: 1h)
    --min_periods=<Wert>   min. Anzahl der Verlaufsperioden (Standard: 52)
    --ema_short_period=<Wert>  Anzahl der Perioden für die kürzere EMA (Standard: 12)
    --ema_long_period=<Wert>  Anzahl der Perioden für die längere EMA (Standard: 26)
    --signal_period=<Wert>  Anzahl der Perioden für das Signal EMA (Standard: 9)
    --up_trend_threshold=<Wert>  Schwelle zum Auslösen eines Kaufsignals (Standard: 0)
    --down_trend_threshold=<Wert>  Schwelle zum Auslösen eines verkauften Signals (Standard: 0)
    --overbought_rsi_periods=<Wert>  Anzahl der Perioden für überkauften RSI (Standard: 25)
    --overbought_rsi=<Wert>  verkauft, wenn RSI diesen Wert überschreitet (Standard: 70)

ta_macd_ext
  Beschreibung:
     Kaufen Sie wann (MACD - Signal> 0) und verkaufen Sie wann (MACD - Signal <0) mit steuerbaren Talib TA-Typen
  Optionen:
    --period=<Wert>  Periodenlänge, wie --period_length (Standard: 1h)
    --min_periods=<Wert>  min. Anzahl der Verlaufsperioden (Standard: 52)
    --ema_short_period=<Wert>  Anzahl der Perioden für die kürzere EMA (Standard: 12)
    --ema_long_period=<Wert>  Anzahl der Perioden für die längere EMA (Standard: 26)
    --signal_period=<Wert>  Anzahl der Perioden für das Signal EMA (Standard: 9)
    --fast_ma_type=<Wert>  fast_ma_type von Talib: SMA, EMA, WMA, DEMA, TEMA, TRIMA, KAMA, MAMA, T3 (Standard: null)
    --slow_ma_type=<Wert>  slow_ma_type von Talib: SMA, EMA, WMA, DEMA, TEMA, TRIMA, KAMA, MAMA, T3 (Standard: null)
    --signal_ma_type=<Wert>  signal_ma_type von talib: SMA, EMA, WMA, DEMA, TEMA, TRIMA, KAMA, MAMA, T3 (Standard: null)
    --default_ma_type=<Wert>  Setzt den Standard-ma_type für schnell, langsam und signal. Sie können einzelne Typen separat überschreiben (fast_ma_type, slow_ma_type, signal_ma_type) (Standard: SMA).
    --up_trend_threshold=<Wert>  Schwelle zum Auslösen eines Kaufsignals (Standard: 0)
    --down_trend_threshold=<Wert>  Schwelle zum Auslösen eines verkauften Signals (Standard: 0)
    --overbought_rsi_periods=<Wert>  Anzahl der Perioden für überkauften RSI (Standard: 25)
    --overbought_rsi=<Wert>  verkauft, wenn RSI diesen Wert überschreitet (Standard: 70)

ta_trix
  Beschreibung:
    TRIX - 1-tägige Änderungsrate (ROC) eines Triple Smooth EMA mit überverkauftem Rsi
  Optionen:
    --period=<Wert>  Periodenlänge, z. B. 10 m (Standard: 5 m)
    --timeperiod=<Wert>  Zeitperiode für TRIX (Standard: 30)
    --overbought_rsi_periods=<Wert>  Anzahl der Perioden für überkauften RSI (Standard: 25)
    --overbought_rsi=<Wert>  verkauft, wenn RSI diesen Wert überschreitet (Standard: 70)

trend_ema (default)
  Beschreibung:
    Kaufen Sie wann (EMA - letzte (EMA)> 0) und verkaufen Sie wann (EMA - letzte (EMA) <0). Optionaler Kauf bei niedrigem RSI.
  Optionen:
    --period=<Wert>  Periodenlänge, wie --period_length (Standard: 2 m)
    --period_length=<Wert>  Periodenlänge wie --period (Standard: 2 m)
    --min_periods=<Wert>  min. Anzahl der Verlaufsperioden (Standard: 52)
    --trend_ema=<Wert>  Anzahl der Perioden für Trend-EMA (Standard: 26)
    --neutral_rate=<Wert>  Trades vermeiden, wenn abs (trend_ema) unter diesem Float (0 zum Deaktivieren, "auto" für einen variablen Filter) (Standard: auto)
    --oversold_rsi_periods=<Wert>  Anzahl der Perioden für überverkaufte RSI (Standard: 14)
    --oversold_rsi=<Wert>  kaufen, wenn RSI diesen Wert erreicht (Standard: 10)

ta_ppo
  Beschreibung:
      PPO - Prozentpreis-Oszillator mit überverkauftem Rsi
  Optionen:
    --period=<Wert>  Periodenlänge, wie --period_length (Standard: 10 m)
    --ema_short_period=<Wert>  Anzahl der Perioden für die kürzere EMA (Standard: 12)
    --ema_long_period=<Wert>  Anzahl der Perioden für die längere EMA (Standard: 26)
    --signal_period=<Wert>  Anzahl der Perioden für das Signal EMA (Standard: 9)
    --overbought_rsi_periods=<Wert>  Anzahl der Perioden für überkauften RSI (Standard: 25)
    --ma_type==<Wert> Talib-Typ mit gleitendem Durchschnitt: SMA, EMA, WMA, DEMA, TEMA, TRIMA, KAMA, MAMA, T3 (Standard: SMA)
    --overbought_rsi=<Wert>  verkauft, wenn RSI diesen Wert überschreitet (Standard: 70)

ta_ultosc
  Beschreibung:
    ULTOSC - Ultimativer Oszillator mit überverkauftem Rsi
  Optionen:
    --period=<Wert>  Periodenlänge, z. B. 5 m (Standard: 5 m)
    --min_periods=<Wert>  min. Anzahl der Verlaufsperioden (Standard: 52)
    --signal=<Wert>  Signal und Indikator "einfach" (Kauf @ 65, Verkauf @ 50), "Niedrig" (Kauf @ 65, Verkauf @ 30), "Trend" (Kauf @ 30, Verkauf @ 70) (Standard: einfach)
    --timeperiod1=<Wert>  talib ULTOSC timeperiod1 (Standard: 7)
    --timeperiod2=<Wert>  talib ULTOSC timeperiod2 (Standard: 14)
    --timeperiod3=<Wert>  talib ULTOSC timeperiod3 (Standard: 28)
    --overbought_rsi_periods=<Wert>  Anzahl der Perioden für überkauften RSI (Standard: 25)
    --overbought_rsi=<Wert>  verkauft, wenn RSI diesen Wert überschreitet (Standard: 90)

ti_hma
  Beschreibung:
    HMA - Rumpf gleitender Durchschnitt
  Optionen:
    --period=<Wert>  Periodenlänge, z. B. 10 m (Standard: 15 m)
    --min_periods=<Wert>  min. Anzahl der Verlaufsperioden (Standard: 52)
    --trend_hma=<Wert>  Anzahl der Perioden für Trend hma (Standard: 36)
    --overbought_rsi_periods=<Wert>  Anzahl der Perioden für überkauften RSI (Standard: 25)
    --overbought_rsi=<Wert>  verkauft, wenn RSI diesen Wert überschreitet (Standard: 70)

trendline
  Beschreibung:
    Berechnen Sie eine Trendlinie und handeln Sie, wenn der Trend positiv oder negativ ist.
  Optionen:
    --period=<Wert>  Periodenlänge (Standard: 30s)
    --period_length=<Wert>  Periodenlänge (Standard: 30s)
    --lastpoints=<Wert>  Anzahl der Trades für den Short-Trend-Durchschnitt (Standard: 100)
    --avgpoints=<Wert>  Anzahl der Trades für den langen Trenddurchschnitt (Standard: 1000)
    --lastpoints2=<Wert>  Anzahl der Trades für den Short-Trend-Durchschnitt (Standard: 10)
    --avgpoints2=<Wert>  Anzahl der Trades für den langen Trenddurchschnitt (Standard: 100)
    --min_periods=<Wert>  Grundsätzlich avgpoints + ein BUNCH mit mehr Preroll-Perioden für einen Zeitraum von weniger als 5 Sekunden (Standard: 15000)
    --markup_sell_pct=<Wert>  Test (Standard: 0)
    --markdown_buy_pct=<Wert>  Test (Standard: 0)

trust_distrust
  Beschreibung:
    Verkaufen, wenn der Preis höher als $ sell_min% und der höchste Punkt - $ sell_threshold% erreicht ist. Kaufen, wenn der niedrigste Preispunkt + $ buy_threshold% erreicht ist.
  Optionen:
    --period=<Wert>  Periodenlänge, wie --period_length (Standard: 30 m)
    --period_length=<Wert>  Periodenlänge wie --period (Standard: 30 m)
    --min_periods=<Wert>  min. Anzahl der Verlaufsperioden (Standard: 52)
    --sell_threshold=<Wert>  verkaufen, wenn die Spitze mindestens unter diesen Prozentsatz fällt (Standard: 2)
    --sell_threshold_max=<Wert>  verkaufen, wenn das Top unter dieses Maximum fällt, unabhängig von sell_min (Panikverkauf, 0 zum Deaktivieren) (Standard: 0)
    --sell_min=<Wert>  wirkt auf nichts, es sei denn, der Preis liegt um diesen Prozentsatz über dem ursprünglichen Preis (Standard: 1)
    --buy_threshold=<Wert>  kaufen, wenn der Boden mindestens über diesen Prozentsatz gestiegen ist (Standard: 2)
    --buy_threshold_max=<Wert>  Warten Sie vor dem Kauf auf mehrere Kaufsignale (Kill Whipsaw, 0 zum Deaktivieren) (Standard: 0)
    --greed=<Wert>  verkaufen, wenn wir so viel Gewinn erreichen (0, um gierig zu sein und entweder zu gewinnen oder zu verlieren) (Standard: 0)

wavetrend
  Beschreibung:
    Kaufen Sie wann (Signal <Überverkauft) und verkaufen Sie wann (Signal> Überkauft).
  Optionen:
    --period=<Wert>  Periodenlänge, wie --period_length (Standard: 1h)
    --period_length=<Wert>  Periodenlänge wie --period (Standard: 1h)
    --min_periods=<Wert>  min. Anzahl der Verlaufsperioden (Standard: 21)
    --wavetrend_channel_length=<Wert>  wavetrend Kanallänge (Standard: 10)
    --wavetrend_average_length=<Wert>  durchschnittliche Wellenlänge (Standard: 21)
    --wavetrend_overbought_1=<Wert>  wavetrend überkauftes Limit 1 (Standard: 60)
    --wavetrend_overbought_2=<Wert>  wavetrend überkauftes Limit 2 (Standard: 53)
    --wavetrend_oversold_1=<Wert>  wavetrend überverkauftes Limit 1 (Standard: -60)
    --wavetrend_oversold_2=<Wert>  wavetrend überverkauftes Limit 2 (Standard: -53)
    --wavetrend_trends=<Wert>  wirkt auf Trends anstatt auf Grenzwerte (Standard: false)
    --overbought_rsi_periods=<Wert>  Anzahl der Perioden für überkauften RSI (Standard: 9)
    --overbought_rsi=<Wert>  verkauft, wenn RSI diesen Wert überschreitet (Standard: 80)
```
