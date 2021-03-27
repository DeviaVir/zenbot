#### Raspberry Pi

Sie können Zenbot auf einem Raspberry Pi und dem Standard-Raspbian-Betriebssystem ausführen. 
Dies wird jedoch nicht empfohlen, da die MongoDB Probleme mit ARM-Systemen sowie 32-Bit-Betriebssystemen hat. 
Da die Datenbank auf 2 GB beschränkt ist.

Stellen Sie sicher, dass die Pakete aktualisiert werden:
```
sudo apt-get update
sudo apt-get upgrade -y
```

Installieren Sie Docker:
```
curl -sSL https://get.docker.com | sh
```

Autostart beim Start:
```
sudo systemctl enable docker
```

Benutzerberechtigungen erteilen:
```
sudo usermod -aG docker <username>
```

Starten Sie neu oder führen Sie `sudo systemctl start docker` aus.

Installieren Sie Docker-Compose:
```
apt-get install python-pip
pip install docker-compose
```

Installieren Sie ein MongoDB Docker-Image für den Rapsberry Pi (wie https://hub.docker.com/r/nonoroazoro/rpi-mongo/):
```
docker pull nonoroazoro/rpi-mongo
```

Benennen Sie die MongoDB-Dockerdatei in "mongo" um (wenn Sie das obige Abbild verwenden):
```
docker tag nonoroazoro/rpi-mongo mongo
```

Installieren Sie Zenbot, beschrieben im [Installationshandbuch](README.md).

Führen Sie Zenbot aus:
```
cd zenbot
docker-compose build
docker-compose up -d
```

Die Befehle sind die gleichen:
```
docker run --rm --link zenbot_mongodb_1:mongodb -it zenbot_server [command]
```
