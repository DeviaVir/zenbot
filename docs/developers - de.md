## Zenbot Exchange API
Dieses Dokument soll Entwicklern helfen, neue Erweiterungen für Zenbot zu implementieren. 

Es wurde aus der Überprüfung der Zenbot-Dateien und der GDAX-Erweiterung rückentwickelt und ist kein endgültiger Leitfaden für die Entwicklung einer Erweiterung. 

Jeder Beitrag, der dieses Dokument verbessert, ist sicherlich willkommen.

Das Dokument ist ein Versuch, die Schnittstellenfunktionen zu beschreiben, die für die Kommunikation mit einem Austausch verwendet werden, sowie einige Hilfsfunktionen. Jede Funktion verfügt über eine Reihe von Aufrufparametern und gibt Werte und Status zurück. 

Die Eingabeparameter werden in das Objekt "opts" gepackt, und die Ergebnisse aus dem Aufrufen der Funktion werden in einem Objekt zurückgegeben.

## Fehlerbehandlung

Fehler werden über eine Rückruffunktion dieser Form an das aufrufende Programm zurückgegeben:
```javascript
cb (err)
```
Der erwartete Inhalt von "err" ist wie folgt:
```javascript
  { code: 'HTTP_STATUS', body: body }
```

** Nicht behebbare Fehler ** sollten von der eigentlichen Erweiterungsfunktion behandelt werden. Ein typischer Fehler ist "Seite nicht gefunden", der höchstwahrscheinlich durch eine fehlerhafte URL verursacht wird. Solche Fehler sollten eine beschreibende Nachricht zurückgeben und einen Programmexit erzwingen.

** Behebbare Fehler **, die Trades betreffen, sollten von zenbot behandelt werden, während andere in der Erweiterungsschicht behandelt werden könnten. Dies muss geklärt werden.


Einige benannte Fehler werden bereits vom Hauptprogramm behandelt (siehe getTrades unten). Diese sind:
```
  'ETIMEDOUT', // möglicherweise wiederherstellbar
  'ENOTFOUND', // nicht wiederherstellbar (404?)
  'ECONNRESET' // möglicherweise wiederherstellbar
```
Zenbot verfügt möglicherweise über einen GDAX-spezifischen Code. Dies betrifft insbesondere Rückgabewerte von Austauschfunktionen. Rückgabewerte sollten im Allgemeinen austauschunabhängig und standardisiert behandelt werden, um das Schreiben von Erweiterungen zu vereinfachen.

** Einige Variablen im "Exchange" -Objekt sind erwähnenswert **
```
  name: 'some_exchange_name'
  historyScan: 'vorwärts', 'rückwärts' or false
  makerFee: exchange_maker_fee (numeric) // Wird von einer Funktion festgelegt, wenn der Austausch dies unterstützt. 
  takerFee: exchange_taker_fee (numeric) // Sonst mit einer Konstante gesetzt. 
  backfillRateLimit: some_value_fitting_exchange_policy or 0
```
## Funktionen

** Verbindung zum Austausch für öffentliche Anfragen herstellen **
```javascript
funcion publicClient ()
```
Angerufen von:
- extension/*/exchange.js

Gibt ein "Client" -Objekt zur Verwendung in Exchange Public Access-Funktionen zurück.

** Private Anfragen verbinden und authentifizieren **
```javascript
function authedClient ()
```
Angerufen von:
- extension/*/exchange.js

Die Funktion ruft Parameter aus conf.js im c-Objekt ab
Insbesondere sind dies:
```
  c.<exchange>.key
  c.<exchange>.secret
```
Für bestimmten Austausch auch:
```
  c.bitstamp.client_id
  c.gdax.passphrase
```
Die Funktion m gibt ein "Client"-Objekt zur Verwendung in Exchange-authentifizierten Zugriffsfunktionen zurück.

** Hilfsfunktion zur Rückgabe konformer Fehlermeldungen **
```javascript
function statusErr (resp, body)
```
Angerufen von:
- extension/*/exchange.js

** Öffentlichen Geschichte und Handelsdaten abrufen **
```javascript
getTrades: function (opts, cb)
```
Angerufen von:
- https://github.com/carlos8f/zenbot/blob/master/commands/backfill.js
- https://github.com/carlos8f/zenbot/blob/master/commands/trade.js

Eingang:
```
  opts.product_id
  opts.from
  opts.to
```
Rückkehr:
```
  trades.length
  (array of?) {
    trade_id: some_id
    time: 'transaction_time',
    size: trade_size,
    price: trade_prize,
    side : 'buy' or 'sell'
  }
```
Erwartete Fehlercodes bei Fehler:
```
  err.code

  'ETIMEDOUT', // möglicherweise wiederherstellbar
  'ENOTFOUND', // nicht wiederherstellbar
  'ECONNRESET' // möglicherweise wiederherstellbar
```
Rückruf:
```javascript
cb(null, trades)
```

**Getting wallet balances**
```javascript
getBalance: function (opts, cb)
```
Angerufen von:
- https://github.com/carlos8f/zenbot/blob/master/lib/engine.js

Eingang:
```
  opts.currency
  opts.asset
```
Rückkehr:
```
  balance.asset
  balance.asset_hold
  balance.currency
  balance.currency_hold
```
Rückruf:
```javascript
cb(null, balance)
```
Kommentar:
Asset vs. Asset_hold und Currency vs. Currency_hold sind für mich etwas mysteriös.
Für die meisten Börsen würde ich nur etwas Ähnliches wie "available_asset" und "available_currency" zurückgeben.
Für Börsen, die einige andere Werte zurückgeben, würde ich die Berechnung auf der Erweiterungsschicht durchführen
und überlassen Sie es nicht engine.js, da available_asset und available_currency nur interessant sind
Werte aus Kauf/Verkaufs-Sicht, IMHO. Wenn jemand es besser weiß, bitte klären.

** Öffentliche Tickerdaten abrufen **
```javascript
getQuote: function (opts, cb)
```
Angerufen von:
- https://github.com/carlos8f/zenbot/blob/master/lib/engine.js
- https://github.com/carlos8f/zenbot/blob/master/commands/buy.js
- https://github.com/carlos8f/zenbot/blob/master/commands/sell.js

Eingang:
```
  opts.product_id
```
Rückkehr:
```
  {bid: value_of_bid, ask: value_of_ask}
```
Rückruf:
```javascript
cb(null, {bid: body.bid, ask: body.ask})
```

** Stornierung einer Bestellung **
```javascript
cancelOrder: function (opts, cb)
```
Angerufen von:
- https://github.com/carlos8f/zenbot/blob/master/lib/engine.js

Eingang:
```
  opts.order_id
```
Rückruf:
```javascript
cb()
```

** Kauffunktion **
```javascript
buy: function (opts, cb)
```
Angerufen von:
- https://github.com/carlos8f/zenbot/blob/master/lib/engine.js

Eingang:
```
  opts.price
  opts.size
```
Returns:
```

```
Rückruf:
```javascript
cb(null, body)
```

** Verkaufsfunktion **
```javascript
sell: function (opts, cb)
```
Angerufen von:
- https://github.com/carlos8f/zenbot/blob/master/lib/engine.js

Eingang:
```
  opts.price
  opts.size
```
Kehrt zurück:
```

```
Rückruf:
```javascript
cb(null, body)
```

**Getting data from a placed order**
```javascript
getOrder: function (opts, cb)
```
Angerufen von:
- https://github.com/carlos8f/zenbot/blob/master/lib/engine.js

Eingang:
```
  opts.order_id
  opts.product_id
```
Kehrt zurück:
```
  order.status
```
Erwartete Werte in https://github.com/carlos8f/zenbot/blob/master/lib/engine.js:
- 'done', 'rejected'
  If 'rejected' order.reject_reason = some_reason ('post only')
Ist '*post only*' für den GDAX spezifisch?
Kommentar: Muss geklärt werden

Rückruf:
```javascript
cb(null, body)
```

** Details von einem ausgeführten Trade erhalten **
```javascript
getCursor: function (trade)
```
Angerufen von:
- https://github.com/carlos8f/zenbot/blob/master/commands/backfill.js
- https://github.com/carlos8f/zenbot/blob/master/commands/trade.js

Eingang:
```
  Handel - Dies ist entweder ein Handel oder ein Zeitstempel
```
Rückkehr:
```
  Handels-ID oder Zeitstempel. Es hängt wirklich von der Exchange-API ab. Einige, wie Gemini, verwenden nur Zeitstempel und müssen nur einen Zeitstempel zurückgeben. Andere, wie der GDAX, arbeiten mit Handels-IDs und es wird erwartet, dass sie "undefiniert" zurückgeben, wenn ein anfänglicher Zeitstempel zum Starten des Nachfüllens überschritten wird.

  Da für das Auffüllen ein Zeitstempel erforderlich ist, um die Anzahl der Tage für das Auffüllen auszuwählen, kann diese Option möglicherweise nicht verwendet werden, wenn die Börse keine Zeitstempel für historische Daten verwendet. In diesem Fall wird 'undefined' zurückgegeben, wenn ein Zeitstempelwert übergeben wird.

```
Rückruf:
```javascript

```

## Erweiterungen

Zenbot bietet verschiedene Erweiterungen an, wohl ist es das, was Zenbot so großartig macht.

### Benachrichtigungen erweitern

Wenn Sie einen neuen Notifier hinzufügen möchten, gehen Sie folgendermaßen vor:

- Erstellen Sie in `/extensions/notifiers/` einen your-service-name.js. Stellen Sie sicher, dass Sie die selben Funktionsrückgaben wie bei anderen Notifiers verwenden.
- Fügen Sie `/conf-sample.js` einen Konfigurations-Bootstrap hinzu.
- senden Sie uns eine PR mit Ihrem neuen Service :)
