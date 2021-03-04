
## Lesen der Konsolenausgabe

![console](Capture.PNG)

Von links nach rechts (für die oben nicht abgebildete Trendlinie, die neuronal ist):

- Zeitstempel in Ortszeit (grau, blau, wenn "Live" -Statistiken angezeigt werden)
- Vermögenspreis in Währung (gelb)
- Prozentuale Preisänderung seit dem letzten Zeitraum (rot/grün)
- Volumen des Vermögenswerts seit der letzten Periode (grau)
- [RSI] (http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:relative_strength_index_rsi) ANSI-Diagramm (rot/grün)
- Strategieinformationen in der Reihenfolge:
```
- col1: aktueller letzter Handelspreis
- col2: Der alte Handelspreis des letzten Handels, ermittelt mit der Vorhersage.
-  Wenn der vorhergesagte Preis und der Durchschnitt des letzten Handelspreises den aktuellen letzten Handelspreis überschreiten, dann kaufen Sie... Wie eine neuronale Trendlinie.
```
- Aktuelles Signal oder Aktion, einschließlich `buy`, `Kaufen`, `Verkaufen`, `Kaufen`, `Verkaufen`, `Verkauft` und `last_trade_worth` (prozentuale Änderung der Trendrichtung seit dem letzten Kauf/Verkauf)
- Aktuelles Signal oder Aktion, einschließlich `buy`, `sell`, `buying`, `selling`, `bought`, `sold` und `last_trade_worth` (prozentuale Änderung der Trendrichtung seit dem letzten Kauf/Verkauf)
- Kontostand (Vermögenswert)
- Kontostand (Währung)
- Gewinn- oder Verlustprozentsatz (kann mit `--reset_profit` zurückgesetzt werden)
- Gewinn oder Verlust gegenüber der Buy/Hold-Strategie

Die Signalisierung für dieses Strategiebeispiel:
```
          learn();
          var item = tlp.reverse();
          s.prediction = predict(item)
          s.mean = s.lookback[0].close
          s.meanp = math.mean(s.prediction, oldmean)
          oldmean = s.prediction
        }
        // NORMAL onPeriod STUFF hier 
        global.meanp = s.meanp
        global.mean = s.mean
        // hier ist etwas seltsames los
        global.sig0 = global.meanp < global.mean
        if (
           global.sig0 === false
           )
           {
            s.signal = 'sell'
           }
        else if
           (
           global.sig0 === true
           )
           {
           s.signal = 'buy'
           }
      cb()
     }
    },
    ```
