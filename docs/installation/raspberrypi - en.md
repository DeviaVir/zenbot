#### Raspberry Pi

You can run Zenbot on a Raspberry Pi and the default Raspbian OS, but it is not recommend because MongoDB has problems with ARM systems as well as 32-bit OSes since it limits the database to 2GB.

Make sure packages are updated:
```
sudo apt-get update
sudo apt-get upgrade -y
```

Install Docker:
```
curl -sSL https://get.docker.com | sh
```

Autostart on startup:
```
sudo systemctl enable docker
```

Give user permissions:
```
sudo usermod -aG docker <username>
```

Reboot, or execute `sudo systemctl start docker`.

Install docker-compose:
```
apt-get install python-pip
pip install docker-compose
```

Install a MongoDB Docker image made for the Rapsberry Pi (like https://hub.docker.com/r/nonoroazoro/rpi-mongo/):
```
docker pull nonoroazoro/rpi-mongo
```

Rename the MongoDB docker-file to "mongo" (if you use the above image):
```
docker tag nonoroazoro/rpi-mongo mongo
```

Install Zenbot, described in the [installation guide](README.md).

Run Zenbot:
```
cd zenbot
docker-compose build
docker-compose up -d
```

Commands are the same:
```
docker run --rm --link zenbot_mongodb_1:mongodb -it zenbot_server [command]
```
