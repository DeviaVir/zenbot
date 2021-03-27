#### Docker verwenden

Um Zenbot unter Docker auszuführen, installieren Sie Docker, Docker Compose und Docker Machine (falls erforderlich).
Sie können den Anweisungen unter https://docs.docker.com/compose/install/ folgen.

Nach der [Installation von Zenbot](README.md):
```
cd zenbot
docker-compose up    # -d, wenn Sie das Protokoll nicht sehen möchten.
```

Wenn Sie Windows ausführen, verwenden Sie den folgenden Befehl:
```
docker-compose --file=docker-compose-windows.yml up
```

Wenn Sie Befehle ausführen möchten (z. B. backfills, list-selectors), können Sie diesen separaten Befehl nach einem erfolgreichen `docker-compose up -d` ausführen:
```
docker-compose exec server zenbot list-selectors
docker-compose exec server zenbot backfill <selector> --days <days>
```

#### Docker wird aktualisiert

Falls Sie mit Updates im Rückstand sind, können Sie Folgendes ausführen:
```
docker pull deviavir/zenbot:unstable
```

Führen Sie `docker-compose up -d` erneut aus, um das neue Image zu starten.

`deviavir/zenbot` wird nach jeder Zusammenführung automatisch aktualisiert.
Sie können den tags/builds unter https://hub.docker.com/r/deviavir/zenbot/builds/ folgen.

Oder zukünftig auch in Deutsch:

`dwhr-pi/zenbot` wird nach jeder Zusammenführung automatisch aktualisiert.
Sie können den tags/builds unter https://hub.docker.com/r/dwhr-pi/zenbot/builds/ folgen.
