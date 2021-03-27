### Zenbot installieren

Führen Sie in Ihrer Konsole das Original aus:
```
git clone https://github.com/deviavir/zenbot.git
```

Oder in der Deutschensprache verwenden Sie diese .git von mir.
```
git clone https://github.com/dwhr-pi/zenbot.git
```

Oder ohne .git Original:
```
wget https://github.com/deviavir/zenbot/archive/master.tar.gz
tar -xf zenbot-master.tar.gz
mv zenbot-master zenbot
```

Oder in der Deutschensprache verwenden Sie dieses ohne .git von mir.
```
wget https://github.com/deviavir/zenbot/archive/master.tar.gz
tar -xf zenbot-master.tar.gz
mv zenbot-master zenbot
```

Erstellen Sie Ihre Konfigurationsdatei, indem Sie `conf-sample.js` nach` conf.js` kopieren:
```
cp conf-sample.js conf.js
```

- `conf.js` anzeigen und dann bearbeiten.
- Es ist möglich, Zenbot im "Papierhandel"-Modus zu verwenden, ohne Änderungen vorzunehmen.
- Sie müssen jedoch Ihre Exchange-API-Schlüssel hinzufügen, um einen echten Handel zu ermöglichen.
- API-Schlüssel benötigen keine Ein-/Auszahlungsberechtigungen.

Wenn Sie Docker verwenden, fahren Sie mit dem [Docker-Handbuch](docker.md) weiter fort.

Abhängigkeiten installieren:
```
cd zenbot
npm install
```

Optional:
Installieren Sie die Binärdatei `zenbot.sh` in `/usr/local/bin`:
```
npm link
```

Führen Sie einen Zenbot-Befehl aus:
```
zenbot --help
```
