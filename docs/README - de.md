## Schnellstart

### 1) Schritt - ​​Anforderungen

- Windows / Linux / macOS 10 (oder Docker)
- [Node.js](https://nodejs.org/) (Version 8.3.0 oder höher) und [MongoDB](https://www.mongodb.com/).

### 2) Schritt Installieren Sie Zenbot 4

Führen Sie in Ihrer Konsole aus,

```
git clone https://github.com/deviavir/Zenbot.git
```

Oder ohne Git,

```
wget https://github.com/deviavir/Zenbot/archive/master.tar.gz
tar -xf master.tar.gz
mv Zenbot-master Zenbot
```

Erstellen Sie Ihre Konfigurationsdatei, indem Sie `conf-sample.js` nach `conf.js` kopieren:

```
cp conf-sample.js conf.js
```

- `conf.js` anzeigen und bearbeiten.
- Es ist möglich, Zenbot im "Papierhandel"-Modus zu verwenden, ohne Änderungen vorzunehmen. 
- Sie müssen jedoch Ihre Exchange-API-Schlüssel hinzufügen, um einen echten Handel zu ermöglichen. 
- API-Schlüssel benötigen KEINE Ein-/Auszahlungsberechtigungen. 

Wenn Sie Docker verwenden, fahren Sie mit Abschnitt "Docker" fort.

Abhängigkeiten installieren:

```
cd Zenbot
npm install
# optional, installiert die Binärdatei `Zenbot.sh` in '/usr/local/bin':
npm link
```

### Ubuntu 16.04 Schritt für Schritt
[Video](https://youtu.be/BEhU55W9pBI)
[Blog Post](https://jaynagpaul.com/algorithmic-crypto-trading?utm_source=Zenbot)

```
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install build-essential mongodb -y

curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs

git clone https://github.com/deviavir/Zenbot.git
cd Zenbot
npm install

./Zenbot.sh trade --paper
```

### Docker (optional)

Um Zenbot unter Docker auszuführen, installieren Sie Docker, Docker Compose und Docker Machine (falls erforderlich). Sie können den Anweisungen unter https://docs.docker.com/compose/install/ folgen.

Nach der Installation (Schritt 2 oben)

```
cd Zenbot
docker-compose up (-d, wenn Sie das Protokoll nicht sehen möchten)
```

Wenn Sie Windows ausführen, verwenden Sie den folgenden Befehl.

```
docker-compose --file=docker-compose-windows.yml up
```

Wenn Sie Befehle ausführen möchten (z. B. Backfills, Listenselektoren) (backfills, list-selectors), können Sie diesen separaten Befehl nach einem erfolgreichen `docker-compose up -d` ausführen:

```
docker-compose exec server Zenbot list-selectors
docker-compose exec server Zenbot backfill <selector> --days <days>
```

#### Docker aktualisieren

Falls Sie mit Updates im Rückstand sind, können Sie Folgendes ausführen:
```
docker pull deviavir/Zenbot:unstable
```
Führen Sie `docker-compose up -d` erneut aus, um das neue Image zu starten.

`deviavir/Zenbot` wird nach jeder Zusammenführung automatisch aktualisiert.
Sie können den tags/builds hier folgen: https://hub.docker.com/r/deviavir/Zenbot/builds/

## Selektoren

Ein "Selektor" ist eine kurze Kennung, die Zenbot mitteilt, auf welches Wechselkurs- und Währungspaar zu reagieren ist. Verwenden Sie das Formular `{exchange_slug}.{asset}-{currency}`. Eine vollständige Liste der Selektoren, die Ihre Zenbot-Installation unterstützt, finden Sie unter:

```
Zenbot-Listenselektoren

gdax:
  gdax.BTC-EUR   (BTC/EUR)
  gdax.BTC-GBP   (BTC/GBP)
  gdax.BTC-USD   (BTC/USD)
  gdax.ETH-BTC   (ETH/BTC)
  gdax.ETH-USD   (ETH/USD)
  gdax.LTC-BTC   (LTC/BTC)
  gdax.LTC-USD   (LTC/USD)

poloniex:
  poloniex.AMP-BTC   (Synereo AMP/BTC)
  poloniex.ARDR-BTC   (Ardor/BTC)
  poloniex.BCN-BTC   (Bytecoin/BTC)
  poloniex.BCN-XMR   (Bytecoin/XMR)
  poloniex.BCY-BTC   (BitCrystals/BTC)

...usw.
```

## Führen Sie eine Simulation für Ihren Selektor aus

Verwenden Sie zum Auffüllen von Daten (vorausgesetzt, Ihr gewählter Austausch unterstützt dies):

```
Zenbot backfill <selector> --days <days>
```

Sie können auch das Start- und Enddatum auswählen:

```
Zenbot backfill <selector> --start="Unixtime in ms" --end="Unixtime in ms"
```
Beachten Sie, dass Sie sie separat verwenden können.

Nach dem Auffüllen können Sie eine Simulation ausführen:

```
Zenbot sim <selector> [options]
```

Verwenden Sie für eine Liste der Optionen für den Befehl `sim`:

```
Zenbot sim --help

```

Verwenden Sie für zusätzliche Optionen im Zusammenhang mit der Strategie:

```
Zenbot list-strategies
```

- Standardmäßig startet die Sim mit 1000 Währungseinheiten. Überschreiben Sie mit `--currency_capital` und `--asset_capital`.
- Öffnen Sie `sim_result.html` in Ihrem Browser, um ein Candlestick-Diagramm mit Trades anzuzeigen.

### Screenshot und Beispielergebnis

Zenbot gibt ein HTML-Diagramm jedes Simulationsergebnisses aus. Im folgenden Screenshot stellen die rosa Pfeile den Kauf (Aufwärtspfeil) und den Verkauf (Abwärtspfeil) des Bots dar, während die historischen Daten des BTC/USD-Produkts der [GDAX](https://gdax.com/) Börse iteriert wurden.

![screenshot](https://cloud.githubusercontent.com/assets/106763/25983930/7e5f9436-369c-11e7-971b-ba2916442eea.png)

```
end balance 2954.50 (195.45%)
buy hold 1834.44 (83.44%)
vs. buy hold 61.06%
110 trades over 91 days (avg 1.21 trades/day)

Endsaldo 2954,50 (195,45%)
Buy Hold 1834,44 (83,44%)
Kauf halten 61,06%
110 Trades über 91 Tage (durchschnittlich 1,21 Trades/Tag)
```

Zenbot begann mit 1.000 USD und endete nach 90 Tagen mit 2.954,50 USD, was einem ROI von 195% entspricht! Trotz einer Buy/Hold-Strategie mit respektablen 83,44% hat Zenbot ein beträchtliches Potenzial, Buy/Holder zu schlagen.

- Beachten Sie, dass in diesem Beispiel optimierte Einstellungen verwendet wurden, um eine optimale Rendite zu erzielen: `--profit_stop_enable_pct=10`, `--profit_stop_pct=4`, `--trend_ema=36`, und `--sell_rate=-0.006`. Standardparameter ergaben einen ROI von ca. 65%.
- [Rohdaten](https://gist.github.com/carlos8f/b09a734cf626ffb9bb3bcb1ca35f3db4) aus der Simulation


## Zenbot ausführen

Der folgende Befehl startet den Bot und wenn Sie `c.selector` in `conf.js` nicht berührt haben, wird das Standard-BTC/USD-Paar am GDAX gehandelt.

```
Zenbot trade [--paper] [--manual]
```

Verwenden Sie das `--paper`-Flag, um nur simulierte Trades auszuführen, während Sie den Markt beobachten.

Verwenden Sie das `--manual`-Flag, um den Preis und den Kontostand zu überwachen, führt Trades jedoch nicht automatisch durch.

So führen Sie einen anderen Selektor aus (Beispiel: ETH-BTC auf Poloniex):

```
Zenbot trade poloniex.eth-btc
```

Verwenden Sie für eine vollständige Liste der Optionen für den `trade`-Befehl: 

```
Zenbot trade --help

  Verwendung: trade [options] [selector]

  Führen Sie einen Handelsbot gegen Live-Marktdaten aus

  Optionen:

    --conf <path>                     Pfad zur optionalen Conf überschreibt Datei. 
    --strategy <name>                 Zu verwendene Strategie. 
    --order_type <type>               Zu verwendender Auftragstyp (Hersteller/Abnehmer) (maker/taker)
    --paper                           Verwendet den Papierhandelsmodus (Es finden keine echten Trades statt.)
    --manual                          Aktueller Preis und Kontostand, aber keine automatischen Trades durchführen.
    --non_interactive                 Deaktiviert Tastatureingaben für den Bot. 
    --currency_capital <amount>       Für den Papierhandel, Betrag des Startkapitals in Währung. 
    --asset_capital <amount>          Für den Papierhandel, Betrag des Startkapitals im Vermögenswert. 
    --avg_slippage_pct <pct>          Durchschn. Menge an Schlupf für Papiergeschäfte. 
    --buy_pct <pct>                   Kaufe mit diesem % des Währungssaldos
    --deposit <amt>                   Absolutes Anfangskapital (in Währung) zur Verfügung der Bots (zuvor --buy_max_amt)
    --sell_pct <pct>                  Verkauft mit diesem % des Vermögenssaldos
    --markdown_buy_pct <pct>          %, um den Kaufpreis zu notieren.
    --markup_sell_pct <pct>           %, um den Verkaufspreis zu markieren.
    --order_adjust_time <ms>          Anzupassen bid/ask in diesem Intervall, um die Wettbewerbsfähigkeit der Bestellungen zu gewährleisten. 
    --order_poll_time <ms>            Status der Abfragereihenfolge in diesem Intervall.
    --sell_stop_pct <pct>             Verkaufen, wenn der Preis unter diesen % des gekauften Preises fällt. 
    --buy_stop_pct <pct>              Kaufen, wenn der Preis über diesen % des Verkaufspreises steigt. 
    --profit_stop_enable_pct <pct>    Aktiviert den nachfolgenden Verkaufsstopp, wenn dieser % Gewinn erreicht wird. 
    --profit_stop_pct <pct>           Behält einen Trailing Stop bei, der um % unter der Hochwassermarke des Gewinns liegt. 
    --max_sell_loss_pct <pct>         Vermeiden Sie den Verkauf mit Verlust pct unter diesem Float. 
    --max_buy_loss_pct <pct>          Vermeiden Sie den Kauf mit Verlust pct über diesen Float. 
    --max_slippage_pct <pct>          Vermeiden Sie den Verkauf mit einem Slippage-pct über diesem Float. 
    --rsi_periods <periods>           Anzahl der Perioden, in denen der RSI berechnet werden soll. 
    --poll_trades <ms>                Fragt in diesem Intervall in ms neue Trades ab. 
    --currency_increment <amount>     Währungsinkrement, falls es sich vom Asset-Inkrement unterscheidet. 
    --keep_lookback_periods <amount>  Behalten Sie so viele Lookback-Perioden max.
    --exact_buy_orders                Anstatt nur den Kauf des Herstellers anzupassen, wenn der Preis steigt, passen Sie ihn an, wenn sich der Preis überhaupt geändert hat
    --exact_sell_orders               Anstatt nur den Maker Sell anzupassen, wenn der Preis fällt, passen Sie ihn an, wenn sich der Preis überhaupt geändert hat. 
    --use_prev_trades                 Lädt und verwendet frühere Trades für Stop-Order-Trigger und Verlustschutz. 
    --min_prev_trades                 Mindestanzahl der vorherigen Trades, die geladen werden sollen, wenn use_prev_trades aktiviert ist. Setzen Sie den Wert auf 0, um die Handelszeit zu deaktivieren und stattdessen zu verwenden. 
    --disable_stats                   Deaktiviert die Statistik der Druckreihenfolge. 
    --reset_profit                    Neue Gewinnberechnung von 0 starten. 
    --use_fee_asset                   Verwenden von separatem Asset zum Bezahlen von Gebühren. Wie binances BNB oder Huobis HT
    --run_for <minutes>               Für einen Zeitraum von Minuten ausführen und dann mit dem Status 0 beenden (Standard: null)
    --debug                           Gibt detaillierte Debug-Informationen aus
    -h, --help                        Verwendungsinformationen ausgeben.
```

und auch:

```
Zenbot-Listenstrategien

bollinger
  Beschreibung:
    Kaufen Sie wann (Signal ≤ unteres Bollinger-Band) und verkaufen Sie wann (Signal ≥ oberes Bollinger-Band).
  Optionen:
    --period=<value>  Periodenlänge, wie --period_length (Standard: 1h)
    --period_length=<value>  Periodenlänge, wie --period (Standard: 1h)
    --min_periods=<value>  min. Anzahl der Verlaufsperioden (Standard: 52)
    --bollinger_size=<value>  Periodengröße (Standard: 20)
    --bollinger_time=<value>  Zeiten der Standardabweichung zwischen dem oberen Band und den gleitenden Durchschnitten (Standard: 2)
    --bollinger_upper_bound_pct=<value>  pct Der aktuelle Preis sollte sich vor dem Verkauf in der Nähe der Bollinger-Obergrenze befinden (Standard: 0).
    --bollinger_lower_bound_pct=<value>  pct Der aktuelle Preis sollte vor dem Kauf in der Nähe der Bollinger-Untergrenze liegen (Standard: 0).

cci_srsi
  Beschreibung:
    Stochastische CCI-Strategie
  Optionen:
    --period=<value>  Periodenlänge, wie --period_length (Standard: 20m)
    --period_length=<value>  Periodenlänge, wie --period (Standard: 20m)
    --min_periods=<value>  min. Anzahl der Verlaufsperioden (Standard: 30)
    --ema_acc=<value>  seitlicher Schwellenwert (0,2-0,4) (Standard: 0.03)
    --cci_periods=<value>  Anzahl der RSI-Perioden (Standard: 14)
    --rsi_periods=<value>  Anzahl der RSI-Perioden (Standard: 14)
    --srsi_periods=<value>  Anzahl der RSI-Perioden (Standard: 9)
    --srsi_k=<value>  %K Zeile (Standard: 5)
    --srsi_d=<value>  %D Zeile (Standard: 3)
    --oversold_rsi=<value>  kaufen, wenn der RSI diesen Wert erreicht oder unterschreitet (Standard: 18)
    --overbought_rsi=<value>  verkaufen, wenn der RSI diesen Wert erreicht oder überschreitet (Standard: 85)
    --oversold_cci=<value>  kaufen, wenn CCI diesen Wert erreicht oder unterschreitet (Standard: -90)
    --overbought_cci=<value>  verkaufen, wenn CCI diesen Wert erreicht oder überschreitet (Standard: 140)
    --constant=<value>  Konstante (Standard: 0.015)
Wenn Sie Fragen zu dieser Strategie haben, kontaktieren Sie mich ...  @talvasconcelos

crossover_vwap
  Beschreibung:
    Estimate trends by comparing "Volume Weighted Average Price" to the "Exponential Moving Average".
  Optionen:
    --period=<value>  Periodenlänge, wie --period_length (Standard: 120m)
    --period_length=<value>  Periodenlänge, wie --period (Standard: 120m)
    --emalen1=<value>  Length von EMA 1 (Standard: 30)
    --smalen1=<value>  Length von SMA 1 (Standard: 108)
    --smalen2=<value>  Length von SMA 2 (Standard: 60)
    --vwap_length=<value>   Mindestdauer für den Start von vwap (Standard: 10)
    --vwap_max=<value>  Maximaler Verlauf für vwap. Wenn Sie dies erhöhen, wird es empfindlicher für kurzfristige Änderungen (Standard: 8000)

dema
  Beschreibung:
    Kaufen Sie wann (kurzes ema> langes ema) und verkaufen Sie wann (kurzes ema <langes ema).
  Optionen:
    --period=<value>  Periodenlänge (Standard: 1h)
    --min_periods=<value>  min. Anzahl der Verlaufsperioden (Standard: 21)
    --ema_short_period=<value>  Anzahl der Perioden für die kürzere EMA (Standard: 10)
    --ema_long_period=<value>  Anzahl der Perioden für die längere EMA (Standard: 21)
    --up_trend_threshold=<value>  Schwelle zum Auslösen eines Kaufsignals (Standard: 0)
    --down_trend_threshold=<value>  Schwellenwert zum Auslösen eines verkauften Signals (Standard: 0)
    --overbought_rsi_periods=<value>  Anzahl der Perioden für überkauften RSI (Standard: 9)
    --overbought_rsi=<value>  verkauft, wenn RSI diesen Wert überschreitet (Standard: 80)
    --noise_level_pct=<value>  wird nicht gehandelt, wenn Short Ema mit diesem % des letzten Short Ema ist. 0 deaktiviert diese Funktion (Standard: 0)

macd
  Beschreibung:
    Kaufen Sie wann (MACD - Signal> 0) und verkaufen Sie wann (MACD - Signal <0).
  Optionen:
    --period=<value>  Periodenlänge, wie --period_length (Standard: 1h)
    --period_length=<value>  Periodenlänge, wie --period (Standard: 1h)
    --min_periods=<value>  min. Anzahl der Verlaufsperioden (Standard: 52)
    --ema_short_period=<value>  Anzahl der Perioden für die kürzere EMA (Standard: 12)
    --ema_long_period=<value>  Anzahl der Perioden für die längere EMA (Standard: 26)
    --signal_period=<value>  Anzahl der Perioden für das Signal EMA (Standard: 9)
    --up_trend_threshold=<value>  threshold to trigger a buy signal (Standard: 0)
    --down_trend_threshold=<value>  Schwellenwert zum Auslösen eines verkauften Signals (Standard: 0)
    --overbought_rsi_periods=<value>  Anzahl der Perioden für überkauften RSI (Standard: 25)
    --overbought_rsi=<value>  verkauft, wenn RSI diesen Wert überschreitet (Standard: 70)

momentum
  Beschreibung:
    MOM = Close(Period) - Close(Length)
  Optionen:
    --momentum_size=<value>  Anzahl der Perioden, in denen auf Momentum (Impuls) zurückgegriffen werden soll (Standard: 5)

neural
  Beschreibung:
    Verwenden Sie neuronales Lernen, um den zukünftigen Preis vorherzusagen. Kaufen=Mittelwert(Der letzten 3 realen Preise) < (aktuellen und letzte Vorhersagen) Buy = mean(last 3 real prices) < mean(current & last prediction)
  Optionen:
    --period=<value>  period length - Stellen Sie sicher, dass Sie die Zeit für Ihre Poll-Trades auf diesen Wert senken. Entspricht --period_length (Standard: 1m)
    --period_length=<value>  Periodenlänge - Stellen Sie sicher, dass Sie die Zeit für den Handel mit Umfragen auf diesen Wert senken. Gleich wie --period (Standard: 1m)
    --activation_1_type=<value>  Neuronaktivierungstyp: sigmoid, tanh, relu (Standard: sigmoid)
    --neurons_1=<value>  Neuronen in Schicht 1 schießen auf mindestens 100 (Standard: 1)
    --depth=<value>  Datenzeilen, die für Übereinstimmungen/Lernen vorhergesagt werden sollen (Standard: 1)
    --selector=<value>  Selektor (Standard: Gdax.BTC-USD)
    --min_periods=<value>  Zu berechnende Zeiträume zu lernen aus (Standard: 1000)
    --min_predict=<value>  Zeiträume, aus denen die nächste Zahl vorhergesagt werden soll (Standard: 1)
    --momentum=<value>  Impuls der Vorhersage (Standard: 0.9)
    --decay=<value>  Zerfall der Vorhersage, verwenden Sie winzige Inkremente (Standard: 0.1)
    --threads=<value>  Anzahl der Verarbeitungsthreads, die Sie ausführen möchten (best for sim) (Standard: 1)
    --learns=<value> Häufigkeit, mit der das neuronale Netzwerk mit früheren Daten 'gelernt' wird (Standard: 2)

noop
  Beschreibung:
    Tu einfach nichts. Kann verwendet werden, um z.B. für das Training der Strategie.
  Optionen:
    --period=<value>  Periodenlänge, wie --period_length (Standard: 30m)
    --period_length=<value>  Periodenlänge, wie --period (Standard: 30m)

rsi
  Beschreibung:
    Attempts to buy low and sell high by tracking RSI high-water readings.
  Optionen:
    --period=<value>  Periodenlänge, wie --period_length (Standard: 2m)
    --period_length=<value>  Periodenlänge, wie --period (Standard: 2m)
    --min_periods=<value>  min. Anzahl der Verlaufsperioden (Standard: 52)
    --rsi_periods=<value>  Anzahl der RSI-Perioden
    --oversold_rsi=<value>  kaufen, wenn der RSI diesen Wert erreicht oder unterschreitet (Standard: 30)
    --overbought_rsi=<value>  verkaufen, wenn der RSI diesen Wert erreicht oder überschreitet (Standard: 82)
    --rsi_recover=<value>  ermöglicht RSI, so viele Punkte vor dem Kauf wiederherzustellen (Standard: 3)
    --rsi_drop=<value>  ermöglicht es dem RSI, vor dem Verkauf so viele Punkte zu verlieren (Standard: 0)
    --rsi_divisor=<value>  verkaufen, wenn RSI den Hochwasserwert erreicht, geteilt durch diesen Wert (Standard: 2)

sar
  Beschreibung:
    Parabolic SAR
  Optionen:
    --period=<value>  Periodenlänge, wie --period_length (Standard: 2m)
    --period_length=<value>  Periodenlänge, wie --period (Standard: 2m)
    --min_periods=<value>  min. Anzahl der Verlaufsperioden (Standard: 52)
    --sar_af=<value>  Beschleunigungsfaktor für parabolische SAR (Standard: 0.015)
    --sar_max_af=<value>  maximaler Beschleunigungsfaktor für parabolische SAR (Standard: 0.3)

speed
  Beschreibung:
    Handeln Sie, wenn die % prozentuale Veränderung gegenüber den letzten beiden 1m (1-Millionen)-Perioden über dem Durchschnitt liegt.
  Optionen:
    --period=<value>  Periodenlänge, wie --period_length (Standard: 1m)
    --period_length=<value>  Periodenlänge, wie --period (Standard: 1m)
    --min_periods=<value>  min. Anzahl der Verlaufsperioden (Standard: 3000)
    --baseline_periods=<value>  Lookback-Zeiträume für die Volatilitätsbasislinie (Standard: 3000)
    --trigger_factor=<value>  multipliziert mit der Volatilitätsbasislinie EMA, um den Triggerwert zu erhalten (Standard: 1.6)

srsi_macd
  Beschreibung:
    Stochastische MACD-Strategie
  Optionen:
    --period=<value>  Periodenlänge, wie --period_length (Standard: 30m)
    --period_length=<value>  Periodenlänge, wie --period (Standard: 30m)
    --min_periods=<value>  min. Anzahl der Verlaufsperioden (Standard: 200)
    --rsi_periods=<value>  Anzahl der RSI-Perioden
    --srsi_periods=<value>  Anzahl der RSI-Perioden (Standard: 9)
    --srsi_k=<value>  %D Zeile (Standard: 5)
    --srsi_d=<value>  %D Zeile (Standard: 3)
    --oversold_rsi=<value>  kaufen, wenn der RSI diesen Wert erreicht oder unterschreitet (Standard: 20)
    --overbought_rsi=<value>  verkaufen, wenn der RSI diesen Wert erreicht oder überschreitet (Standard: 80)
    --ema_short_period=<value>  Anzahl der Perioden für die kürzere EMA (Standard: 24)
    --ema_long_period=<value>  Anzahl der Perioden für die längere EMA (Standard: 200)
    --signal_period=<value>  Anzahl der Perioden für das Signal EMA (Standard: 9)
    --up_trend_threshold=<value>  Schwelle zum Auslösen eines Kaufsignals (Standard: 0)
    --down_trend_threshold=<value>  Schwellenwert zum Auslösen eines verkauften Signals (Standard: 0)

stddev
  Beschreibung:
    Kaufen Sie bei Standardabweichung und mittlerem Anstieg, verkaufen Sie bei mittlerer Abnahme.
  Optionen:
    --period=<value>  Periodenlänge, Poll Trades auf 100ms setzen, Poll Order 1000ms. Gleich wie --period_length (Standard: 100ms)
    --period_length=<value>  Periodenlänge, setze Poll Trades auf 100ms, Poll Order 1000ms. Gleich wie --period (Standard: 100ms)
    --trendtrades_1=<value>  Trades für Array 1, das stddev und Mittelwert von subtrahiert werden soll (Standard: 5)
    --trendtrades_2=<value>  Trades für Array 2, das stddev und Mittelwert aus berechnet werden soll (Standard: 53)
    --min_periods=<value>  min_periods (Standard: 1250)

ta_ema
  Beschreibung:
    Kaufen Sie wann (EMA - letzte (EMA)> 0)  (EMA - last(EMA) > 0) und verkaufen Sie wann (EMA - letzte (EMA) <0) (EMA - last(EMA) < 0). Optionaler Kauf bei niedrigem RSI.
  Optionen:
    --period=<value>  Periodenlänge, wie --period_length (Standard: 10m)
    --period_length=<value>  Periodenlänge, wie --period (Standard: 10m)
    --min_periods=<value>  min. Anzahl der Verlaufsperioden (Standard: 52)
    --trend_ema=<value>  Anzahl der Perioden für Trend-EMA (Standard: 20)
    --neutral_rate=<value>  Trades vermeiden, wenn abs (trend_ema) unter diesem Float (0 zum Deaktivieren, "auto" für einen variablen Filter) (Standard: 0.06)
    --oversold_rsi_periods=<value>  Anzahl der Perioden für überverkaufte RSI (Standard: 20)
    --oversold_rsi=<value>  kaufen, wenn RSI diesen Wert erreicht (Standard: 30)

ta_macd
  Beschreibung:
    Kaufen Sie wann (MACD - Signal>0) und verkaufen Sie wann (MACD - Signal<0).
  Optionen:
    --period=<value>  Periodenlänge, wie --period_length (Standard: 1h)
    --period_length=<value>  Periodenlänge, wie --period (Standard: 1h)
    --min_periods=<value>  min. Anzahl der Verlaufsperioden (Standard: 52)
    --ema_short_period=<value>  Anzahl der Perioden für die kürzere EMA (Standard: 12)
    --ema_long_period=<value>  Anzahl der Perioden für die längere EMA (Standard: 26)
    --signal_period=<value>  Anzahl der Perioden für das Signal EMA (Standard: 9)
    --up_trend_threshold=<value>  Schwelle zum Auslösen eines Kaufsignals (Standard: 0)
    --down_trend_threshold=<value> Schwellenwert zum Auslösen eines verkauften Signals (Standard: 0)
    --overbought_rsi_periods=<value>   Anzahl der Perioden für überkauften RSI (Standard: 25)
    --overbought_rsi=<value>  verkauft, wenn RSI diesen Wert überschreitet (Standard: 70)

ta_macd_ext
  Beschreibung:
    Kaufen Sie wann (MACD - Signal>0) und verkaufen Sie wann (MACD - Signal<0) mit steuerbaren Talib TA-Typen
  Optionen:
    --period=<value>  Periodenlänge, wie --period_length (Standard: 1h)
    --min_periods=<value>  min. Anzahl der Verlaufsperioden (Standard: 52)
    --ema_short_period=<value>  Anzahl der Perioden für die kürzere EMA (Standard: 12)
    --ema_long_period=<value>  Anzahl der Perioden für die längere EMA (Standard: 26)
    --signal_period=<value>  Anzahl der Perioden für das Signal EMA (Standard: 9)
    --fast_ma_type=<value>  fast_ma_type of talib: SMA, EMA, WMA, DEMA, TEMA, TRIMA, KAMA, MAMA, T3 (Standard: null)
    --slow_ma_type=<value>  slow_ma_type of talib: SMA, EMA, WMA, DEMA, TEMA, TRIMA, KAMA, MAMA, T3 (Standard: null)
    --signal_ma_type=<value>  signal_ma_type of talib: SMA, EMA, WMA, DEMA, TEMA, TRIMA, KAMA, MAMA, T3 (Standard: null)
    --default_ma_type=<value>  set default ma_type for fast, slow and signal. You are able to overwrite single types separately (fast_ma_type, slow_ma_type, signal_ma_type) (Standard: SMA)
    --up_trend_threshold=<value>  threshold to trigger a buy signal (Standard: 0)
    --down_trend_threshold=<value>  threshold to trigger a sold signal (Standard: 0)
    --overbought_rsi_periods=<value>  Anzahl der Perioden für überkauften RSI (Standard: 25)
    --overbought_rsi=<value>  verkauft, wenn RSI diesen Wert überschreitet(Standard: 70)

ta_trix
  Beschreibung:
    TRIX - 1-day Rate-Of-Change (ROC) of a Triple Smooth EMA with rsi oversold
  Optionen:
    --period=<value>  period length eg 10m (Standard: 5m)
    --timeperiod=<value>  timeperiod for TRIX (Standard: 30)
    --overbought_rsi_periods=<value>  Anzahl der Perioden für überkauften RSI (Standard: 25)
    --overbought_rsi=<value>  verkauft, wenn RSI diesen Wert überschreitet(Standard: 70)

trend_ema (default)
  Beschreibung:
    Buy when (EMA - last(EMA) > 0) and sell when (EMA - last(EMA) < 0). Optional buy on low RSI.
  Optionen:
    --period=<value>  Periodenlänge, wie --period_length (Standard: 2m)
    --period_length=<value>  Periodenlänge, wie --period (Standard: 2m)
    --min_periods=<value>  min. Anzahl der Verlaufsperioden (Standard: 52)
    --trend_ema=<value>  number of periods for trend EMA (Standard: 26)
    --neutral_rate=<value>  avoid trades if abs(trend_ema) under this float (0 to disable, "auto" for a variable filter) (Standard: auto)
    --oversold_rsi_periods=<value>  number of periods for oversold RSI (Standard: 14)
    --oversold_rsi=<value>  buy when RSI reaches this value (Standard: 10)

ta_ppo
  Beschreibung:
     PPO - Percentage Price Oscillator with rsi oversold
  Optionen:
    --period=<value>  Periodenlänge, wie --period_length (Standard: 10m)
    --ema_short_period=<value>  Anzahl der Perioden für die kürzere EMA (Standard: 12)
    --ema_long_period=<value>  Anzahl der Perioden für die längere EMA (Standard: 26)
    --signal_period=<value>  Anzahl der Perioden für das Signal EMA (Standard: 9)
    --overbought_rsi_periods=<value>  Anzahl der Perioden für überkauften RSI (Standard: 25)
    --ma_type==<value> mgleitender Durchschnittstyp von Talib: SMA, EMA, WMA, DEMA, TEMA, TRIMA, KAMA, MAMA, T3 (Standard: SMA)
    --overbought_rsi=<value>  verkauft, wenn RSI diesen Wert überschreitet(Standard: 70)

ta_ultosc
  Beschreibung:
    ULTOSC - Ultimativer Oszillator mit überverkauftem RSI
  Optionen:
    --period=<value>  Periodenlänge z.B. 5m (Standard: 5m)
    --min_periods=<value>  min. Anzahl der Verlaufsperioden (Standard: 52)
    --signal=<value>  Signal und Indikator "simple" (Kauf@65, Verkauf@50), "Niedrig" (Kauf@65, Verkauf@30), "Trend" (Kauf@30, Verkauf@70) (Standard: simple) (buy@65, sell@50), "low" (buy@65, sell@30), "trend" (buy@30, sell@70) (Standard: simple)
    --timeperiod1=<value>  talib ULTOSC timeperiod1 (Standard: 7)
    --timeperiod2=<value>  talib ULTOSC timeperiod2 (Standard: 14)
    --timeperiod3=<value>  talib ULTOSC timeperiod3 (Standard: 28)
    --overbought_rsi_periods=<value>  Anzahl der Perioden für überkauften RSI (Standard: 25)
    --overbought_rsi=<value>  verkauft, wenn RSI diesen Wert überschreitet(Standard: 90)

ti_hma
  Beschreibung:
    HMA - Rumpf gleitender Durchschnitt
  Optionen:
    --period=<value>  Periodenlänge z.B. 10m  (Standard: 15m)
    --min_periods=<value>  min. Anzahl der Verlaufsperioden (Standard: 52)
    --trend_hma=<value>  Anzahl der Perioden für Trend hma (Standard: 36)
    --overbought_rsi_periods=<value>  Anzahl der Perioden für überkauften RSI (Standard: 25)
    --overbought_rsi=<value>  verkauft, wenn RSI diesen Wert überschreitet(Standard: 70)

trendline
  Beschreibung:
    Berechnen Sie eine Trendlinie und handeln Sie, wenn der Trend positiv oder negativ ist.
  Optionen:
    --period=<value>  Periodenlänge (Standard: 30s)
    --period_length=<value>  Periodenlänge (Standard: 30s)
    --lastpoints=<value>  Anzahl der Trades für den Short-Trend-Durchschnitt (Standard: 100)
    --avgpoints=<value>  Anzahl der Trades für den langen Trenddurchschnitt (Standard: 1000)
    --lastpoints2=<value>  Anzahl der Trades für den Short-Trend-Durchschnitt (Standard: 10)
    --avgpoints2=<value>  Anzahl der Trades für den langen Trenddurchschnitt (Standard: 100)
    --min_periods=<value>  Grundsätzlich avgpoints + ein Bündel von mehr Preroll-Perioden für einen Zeitraum von weniger als 5 Sekunden (Standard: 15000)
    --markup_sell_pct=<value>  test (Standard: 0)
    --markdown_buy_pct=<value>  test (Standard: 0)

trust_distrust
  Beschreibung:
    Verkaufen, wenn der Preis höher als $sell_min% und der höchste Punkt - $sell_threshold% erreicht ist. Kaufen, wenn der niedrigste Preispunkt + $buy_threshold% erreicht ist.
  Optionen:
    --period=<value>  Periodenlänge, wie --period_length (Standard: 30m)
    --period_length=<value>  Periodenlänge, wie --period (Standard: 30m)
    --min_periods=<value>  min. Anzahl der Verlaufsperioden (Standard: 52)
    --sell_threshold=<value>  verkaufen, wenn die Spitze mindestens unter diesen Prozentsatz fällt (Standard: 2)
    --sell_threshold_max=<value>  verkaufen, wenn das Top unter dieses Maximum fällt, unabhängig von sell_min (Panikverkauf, 0 zum Deaktivieren) (Standard: 0)
    --sell_min=<value>  wirkt auf nichts, es sei denn, der Preis liegt um diesen Prozentsatz über dem ursprünglichen Preis (Standard: 1)
    --buy_threshold=<value>  kaufen, wenn der Boden mindestens über diesen Prozentsatz gestiegen ist (Standard: 2)
    --buy_threshold_max=<value>  Warten Sie vor dem Kauf auf mehrere Kaufsignale (kill whipsaw, 0 deaktivieren) (Standard: 0)
    --greed=<value>  verkaufen, wenn wir so viel Gewinn erreichen (0, um gierig zu sein und entweder zu gewinnen oder zu verlieren) (Standard: 0)

wavetrend
  Beschreibung:
    Kaufen Sie wenn (Signal<Überverkauft) und verkaufen Sie wann (Signal>Überkauft)
  Optionen:
    --period=<value>  Periodenlänge, wie --period_length (Standard: 1h)
    --period_length=<value>  Periodenlänge, wie --period (Standard: 1h)
    --min_periods=<value>  min. Anzahl der Verlaufsperioden (Standard: 21)
    --wavetrend_channel_length=<value>  wavetrend Kanallänge (Standard: 10)
    --wavetrend_average_length=<value>  durchschnittliche Wellenlänge (Standard: 21)
    --wavetrend_overbought_1=<value>  wavetrend überkauftes Limit 1 (Standard: 60)
    --wavetrend_overbought_2=<value>  wavetrend überkauftes Limit 2 (Standard: 53)
    --wavetrend_oversold_1=<value>  wavetrend überverkauftes Limit 1 (Standard: -60)
    --wavetrend_oversold_2=<value>  wavetrend überverkauftes Limit 2 (Standard: -53)
    --wavetrend_trends=<value>  wirkt auf Trends anstatt auf Grenzwerte (Standard: false)
    --overbought_rsi_periods=<value>  Anzahl der Perioden für überkauften RSI (Standard: 9)
    --overbought_rsi=<value>  verkauft, wenn RSI diesen Wert überschreitet (Standard: 80)
```

## Interaktive Steuerelemente

Während der Befehl `trade` ausgeführt wird, reagiert Zenbot auf folgende Tastendruckbefehle: 

- Durch Drücken von `b` wird ein Kauf ausgelöst, `s` for sell, and `B` and `S` for market (taker) orders.
- Durch Drücken von `c` oder `C` werden alle aktiven Bestellungen storniert.
- Durch Drücken von `m` or `M` wird der manuelle Modus umgeschaltet (`--manual`)

Diese Befehle können verwendet werden, um zu überschreiben, was der Bot tut. Wenn Sie mit der `--manual`-Flag arbeiten, können Sie alle Handelsentscheidungen selbst treffen.


### noop Strategie

Wenn Sie den Bot verwenden möchten, ohne dass er für Sie handelt, aber nur für die Kontostandübersicht und manuelle Trades verwenden möchten, können Sie den Bot mit `--strategy noop` starten. Der Bot wird nicht automatisch handeln.

## Conf/argument überschreibt Dateien

Verwenden Sie zum Ausführen von `trade` - oder `sim`-Befehlen mit einem vordefinierten Satz von Optionen:

```
Zenbot trade --conf <path>
```

Wobei `<path>` auf eine JS-Datei verweist, die einen Objekt-Hash exportiert, der alle Conf- oder Argumentvariablen überschreibt. In dieser Datei wird beispielsweise gdax.ETH-USD mit marktspezifischen Optionen ausgeführt:

```
var c = module.exports = {}

// ETH-Einstellungen (Hinweis: Dies ist nur ein Beispiel, nicht unbedingt zu empfehlen)
c.selector = 'gdax.ETH-USD'
c.period = '10m'
c.trend_ema = 20
c.neutral_rate = 0.1
c.oversold_rsi_periods = 20
c.max_slippage_pct = 10
c.order_adjust_time = 10000
```

## GUI

Eine grundlegende Web-Benutzeroberfläche ist unter der beim Start angegebenen URL verfügbar. Dieser Port kann in der Datei conf.js konfiguriert oder zufällig zugewiesen werden.
In den Kinderschuhen gibt es einige Einschränkungen bei der aktuellen Benutzeroberfläche.
- Damit Statistiken angezeigt werden, müssen sie zuerst von der CLI ausgegeben werden. Durch Drücken von "D" werden die Statistiken bei jeder Aktualisierung des Dashboards aktualisiert.
- Derzeit sind die Daten mit Ausnahme der Tradingview-Charts größtenteils statisch.
- Derzeit nur READ-ONLY


## Lesen der Konsolenausgabe

![console](https://rawgit.com/deviavir/Zenbot/master/assets/console.png)

Von links nach rechts:

- Zeitstempel in Ortszeit (grau, blau, wenn "Live" -Statistiken angezeigt werden)
- Vermögenspreis in Währung (gelb)
- Prozentuale Preisänderung seit dem letzten Zeitraum (rot/grün)
- Volumen des Vermögenswerts seit der letzten Periode (grau)
- [RSI](http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:relative_strength_index_rsi) ANSI-Diagramm (rot/grün)
- `trend_ema_rate` (rot/grün, unten erklärt)
- Aktuelles Signal oder Aktion, einschließlich 'Kaufen', 'Verkaufen', 'Kaufen', 'Verkaufen', 'Kaufen', 'Verkaufen' und 'last_trade_worth' (prozentuale Änderung der Trendrichtung seit dem letzten Kauf/Verkauf)
- Aktuelles Signal oder Aktion, einschließlich `buy`, `sell`, `buying`, `selling`, `bought`, `sold` and `last_trade_worth` (percent change in the trend direction since last buy/sell)
- Kontostand (Vermögenswert)
- Kontostand (Währung)
- Gewinn- oder Verlustprozentsatz (kann mit `--reset_profit` zurückgesetzt werden)
- Gewinn oder Verlust vs. Buy/Hold-Strategie


## Strategien

### Die `trend_ema`-Strategie (Standard)

- Die Standardstrategie heißt `trend_ema` und befindet sich unter `./extensions/strategies/trend_ema`.
- Standardmäßig wird ein Zeitraum von 2m verwendet. Sie können dies jedoch überschreiben, indem Sie z.B. `--period=5m` zu den Befehlen `sim` oder `trade`.
- Berechnet die 26-Perioden-EMA des aktuellen Preises und berechnet die prozentuale Änderung gegenüber der EMA der letzten Periode, um die "trend_ema_rate" zu erhalten
- Betrachtet `trend_ema_rate> = 0` als Aufwärtstrend und `trend_ema_rate <0` als Abwärtstrend
- Filtert niedrige Werte (Peitschensägen) nach 'neutral_rate' heraus, wobei bei Einstellung auf 'auto' die Standardabweichung der 'trend_ema_rate' als variabler Rauschfilter verwendet wird.
- Kauft zu Beginn des Aufwärtstrends, verkauft zu Beginn des Abwärtstrends
- Wenn `oversold_rsi` gesetzt ist, wird versucht zu kaufen, wenn der RSI unter diesen Wert fällt, und beginnt sich dann zu erholen (ein Gegenstück zu `--profit_stop_enable_pct`, das verkauft, wenn ein Prozent des Gewinns erreicht ist, und dann sinkt)
- Der Bot wird immer versuchen, Handelsgebühren zu vermeiden, indem er Post-Only-Bestellungen verwendet und somit ein Market "maker" anstelle eines "taker" ist. Einige Börsen bieten jedoch keine Herstellerrabatte an.

### Die `macd` Strategie

Die Berechnung der Konvergenzdivergenz im gleitenden Durchschnitt ist ein nacheilender Indikator, der zur Verfolgung von Trends verwendet wird.

- Kann für Handelsperioden von 1 Stunde sehr effektiv sein, mit einer kürzeren Periode wie 15 Millionen scheint es zu unberechenbar und die gleitenden Durchschnitte gehen irgendwie verloren.
- Es werden nicht mehrere Kauf- oder Verkaufssignale ausgelöst, sondern nur eines pro Trend, was zu einem Handelsschema mit besserer Qualität zu führen scheint.
- Insbesondere wenn der Bot mitten in einem Trend eintritt, wird der Kauf vermieden, es sei denn, dies ist der Beginn des Trends.

### Die `rsi` Strategie

Versuche, niedrig zu kaufen und hoch zu verkaufen, indem RSI-Höchstwerte verfolgt werden.

- Wirksam in Seitwärtsmärkten oder Märkten, die sich nach Preissenkungen tendenziell erholen.
- Die Verwendung auf Bärenmärkten ist riskant, da der Algorithmus von der Preiserholung abhängt.
- Wenn die anderen Strategien Geld verlieren, kann diese Strategie eine bessere Leistung erbringen, da sie im Grunde genommen "die Signale umkehrt" und eine Umkehrung erwartet, anstatt zu erwarten, dass sich der Trend fortsetzt.

### Die `sar` Strategie

Verwendet einen [Parabolic SAR](http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:parabolic_sar) Indikator, um zu handeln, wenn sich der SAR-Trend umkehrt.

- Neigt dazu, frühere Signale als EMA-basierte Strategien zu generieren, was zu einer besseren Erfassung von Hochs und Tiefs und einem besseren Schutz vor schnellen Preissenkungen führt.
- Funktioniert nicht gut in seitwärts gerichteten (nicht trendigen) Märkten und generiert mehr Peitschenhiebe als EMA-basierte Strategien.
- Am effektivsten mit kurzer Zeit (Standard ist 2 Mio.), was bedeutet, dass 50-100 Trades/Tag generiert werden, sodass derzeit nur im GDAX (mit 0% Herstellergebühr) verwendet werden kann.
- Live getestet, [Ergebnisse hier](https://github.com/carlos8f/Zenbot/pull/246#issuecomment-307528347)

### Die `speed`-Strategie

Handeln Sie, wenn die prozentuale Veränderung % gegenüber den letzten beiden 1m (1-Millionen)-Perioden über dem Durchschnitt liegt.

** Diese Strategie ist experimentell und hat sehr unterschiedliche Simulationsergebnisse. NOCH NICHT EMPFOHLEN. **

- Wie die Sar-Strategie erzeugt dies frühe Signale und kann in volatilen Märkten und zum Schutz vor plötzlichen Preissenkungen wirksam sein.
- Seine Schwäche besteht darin, dass es in Situationen mit geringer Volatilität sehr schlecht abschneidet und Signale von sich allmählich entwickelnden Trends verfehlt.

### Tipps zum Optimieren von Optionen

- Die Handelsfrequenz wird mit einer Kombination aus `--period` und `--trend_ema` angepasst. Wenn Sie beispielsweise häufiger handeln möchten, versuchen Sie `--period=5m` oder `--trend_ema=15` oder beides. 


If you get too many ping-pong trades or losses from fees, try increasing `period` or `trend_ema` or increasing `neutral_rate`.
- Manchmal ist es verlockend, dem Bot-Handel sehr oft davon zu erzählen. Versuchen Sie, diesem Drang zu widerstehen, und streben Sie nach Qualität vor Quantität, da jeder Trade mit einem angemessenen Rutsch- und Peitschenrisiko verbunden ist.
- `--oversold_rsi=<rsi>` wird versuchen zu kaufen, wenn der Preis sinkt. Dies ist eine der Möglichkeiten, um einen Gewinn über Buy/Hold zu erzielen. Wenn Sie ihn jedoch zu hoch einstellen, kann dies zu einem Verlust führen, wenn der Preis weiter fällt.
- In einem Markt mit vorhersehbaren Preisanstiegen und Korrekturen versucht `--profit_stop_enable_pct=10` zu verkaufen, wenn der letzte Kauf 10% Gewinn erreicht und dann auf 9% fällt (der Rückgang % wird mit `--profit_stop_pct` festgelegt). In starken, langen Aufwärtstrends kann diese Option jedoch zu einem frühen Verkauf führen.
- Für Kraken und GDAX möchten Sie möglicherweise `--order_type="taker"` verwenden, dies verwendet Market Orders anstelle von Limit Orders. Normalerweise zahlen Sie eine höhere Gebühr, aber Sie können sicher sein, dass Ihre Bestellung sofort ausgeführt wird. Dies bedeutet, dass die Sim Ihrem Live-Handel besser entspricht. Bitte beachten Sie, dass der GDAX keine Herstellergebühren (Limit Orders) erhebt. Sie müssen daher wählen, ob Sie keine Gebühren zahlen und die Risikoaufträge nicht rechtzeitig ausführen oder einen hohen Prozentsatz der Gebühren zahlen und sicherstellen möchten, dass Ihre Bestellungen immer gültig sind pünktlich gefüllt.

## Benachrichtigungen

Zenbot verwendet verschiedene Benachrichtigungen, um Sie über die Aktionen des Bots auf dem Laufenden zu halten. Wir senden derzeit eine Benachrichtigung über ein Kauf- und ein Verkaufssignal.

### pushbullet

Geben Sie Zenbot Ihren API-Schlüssel und Ihre Geräte-ID an, und wir senden Ihre Benachrichtigungen an Ihr Gerät.
https://www.pushbullet.com/

### Slack

Versorgen Sie Zenbot mit einem Webhook-URI, und Zenbot sendet Benachrichtigungen an Ihren Webhook.
https://slack.com/

### XMPP

Geben Sie Zenbot Ihre XMPP-Anmeldeinformationen ein, und Zenbot sendet Benachrichtigungen, indem Sie eine Verbindung zu Ihrem XMPP herstellen, die Benachrichtigung senden und die Verbindung trennen.
https://xmpp.org/

### IFTTT

Geben Sie Zenbot Ihren IFTTT-Herstellerschlüssel an, und Zenbot sendet Benachrichtigungen an Ihren IFTTT.
https://ifttt.com/maker_webhooks

### DISCORD

Geben Sie Zenbot Ihre Discord-Webhook-ID an, und der Webhook-Token Zenbot sendet Benachrichtigungen an Ihren Discord-Kanal.

So fügen Sie einem Discord-Kanal einen Webhook hinzu
https://support.discordapp.com/hc/en-us/articles/228383668

### Prowl

Wenn Sie Zenbot mit Ihrem Prowl-API-Schlüssel versorgen, sendet Zenbot Benachrichtigungen an Ihre Prowl-fähigen Geräte.
https://www.prowlapp.com/

### TextBelt

Geben Sie Zenbot Ihren TextBelt-API-Schlüssel ein, und Zenbot sendet SMS-Benachrichtigungen an Ihr Mobiltelefon.
https://www.textbelt.com/

### Telegram
Versorge zenbot mit deinem Telegramm-Bot-Token und der Chat-ID zenbot sendet Benachrichtigungen an deinen Telegramm-Chat.
https://telegram.org/

### ADAMANT Messenger

Geben Sie Zenbot die ADM-Adressen der Empfänger, die PassPhrase des Absenderkontos und die Knotenliste an, und Zenbot sendet Benachrichtigungen an ADAMANT-Chats.
https://adamant.im/

## Rest API

Sie können eine Rest-API für Zenbot aktivieren, indem Sie die folgende Konfiguration aktivieren.
```
c.output.api = {}
c.output.api.on = true
c.output.api.port = 0 // 0 = random port
```
Sie können einen Port auswählen oder 0 für einen zufälligen Port auswählen.

Sobald Sie dies getan haben, können Sie die API unter folgender Adresse aufrufen: http://\<hostname\>:\<port\>/trades

## Manuelle Handelswerkzeuge

Die Order Execution Engine von Zenbot kann auch für manuelle Trades verwendet werden. Zu den Vorteilen gehören:

- Vermeidet Marktauftragsgebühren durch Verwendung einer kurzfristigen Limit Order
- Kann die Bestellgröße automatisch aus dem Kontostand ermitteln
- Passt die Reihenfolge alle 30 Sekunden an (falls erforderlich), um eine schnelle Ausführung zu gewährleisten
- Wenn eine Bestellung teilweise ausgeführt wird, wird versucht, mit der verbleibenden Größe nachzubestellen

Der Befehl zum Kaufen lautet:

```
Zenbot buy <selector> [--size=<size>] [--pct=<pct>]
```

So verwenden Sie beispielsweise Ihr verbleibendes USD-Guthaben im GDAX, um Bitcoin zu kaufen:

```
Zenbot buy gdax.BTC-USD
```

Oder um 10% Ihres BTC zu verkaufen,

```
Zenbot sell gdax.BTC-USD --pct=10
```
