# Zenbot-Tipps für Kraken

Die folgenden Tipps können die Zuverlässigkeit bei der Verwendung von Zenbot mit Kraken erhöhen. 

## API Rate Limit (API Ratenlimit überschritten)

Diese Fehler führen dazu, dass Zenbot in einem bestimmten Zeitraum zu viele Anfragen an Kraken sendet:
> Kraken API error - getTrades kann nicht aufgerufen werden (Fehler: Kraken-API hat den Fehler zurückgegeben: API:Rate limit exceeded) und wird erneut versucht.

Es gibt zwei Möglichkeiten:
* Erhöhen Sie Ihre [Kraken Account Tier](https://support.kraken.com/hc/en-us/articles/206548367-What-is-the-API-call-rate-limit-). Konten höherer Stufen haben ein entspannteres Ratenlimit.
* Erhöhen Sie die Poll-Timer im Zenbot `conf.js`. Dies reduziert die Anzahl der Anfragen, die Zenbot in einem bestimmten Zeitraum sendet. 

### Poll Timers
Die folgenden `conf.js` -Einstellungen haben dazu beigetragen, dies zu verhindern:
```javascript
// Auftragsstatus alle 3 Sekunden abfragen
c.order_poll_time = 3000

// Alle 6 Sekunden neue Trades abfragen
c.poll_trades = 6000
```

## Kraken API hat Fehler zurückgegeben: API:Invalid nonce

Dies ist ein häufiger Fehler beim regelmäßigen Aufrufen von Exchange-APIs:
>Kraken API warning - getBalance kann nicht aufgerufen werden (Fehler: Kraken API hat den Fehler zurückgegeben: API:Invalid nonce) und wird in 0,15 Sekunden wiederholt.

Nonce-Fehler sind normalerweise kein Problem, können jedoch zu einer leichten Verzögerung Ihres Handels führen. In Kraken können Sie Ihr API Nonce-Fenster vergrößern und so die Wahrscheinlichkeit verringern, dass dies geschieht. 

Melden Sie sich bei Ihrem Kraken-Konto an, navigieren Sie durch *Settings* und dann *API*, wählen Sie Ihren API-Schlüssel aus und erhöhen Sie Ihr *Nonce Window* für den von Zenbot verwendeten API-Schlüssel. 


## Bestellungen aufgegeben und vergessen

Ich habe gesehen, wie Zenbot mit "Verkaufen" `Selling` oder "Kaufen" `Buying` feststeckte. 
Wenn ich in Kraken nach offenen Bestellungen suche, sehe ich dort die offene Bestellung, aber Zenbot scheint nicht bemerkt zu haben, dass die Bestellung aufgegeben wurde. 
Dies geschieht normalerweise, während die Kraken-API unter hoher Last steht.

Die Lösung hierfür ist eine einfache Änderung in der Javascript-Datei:
```
node_modules/kraken-api/kraken.js
```

Suchen Sie nach dieser Zeile:
```
	var config = {
		url: 'https://api.kraken.com',
		version: '0',
		key: key,
		secret: secret,
		otp: otp,
		timeoutMS: 5000
	};
```

Erhöhen Sie den timeoutMS-Wert, zum Beispiel:
```
	var config = {
		url: 'https://api.kraken.com',
		version: '0',
		key: key,
		secret: secret,
		otp: otp,
		timeoutMS: 30000
	};
```