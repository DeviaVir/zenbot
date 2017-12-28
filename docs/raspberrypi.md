You can run zenbot on a Raspberry Pi and the default Raspbian OS, but I don't recommend it because mongo has problems with ARM systems as well as 32-bit OSes since it limits the database to 2GB.

**1. Make sure packages are updated**

```
sudo apt update
sudo apt upgrade
```

**2. Install docker and docker-compose**

Install docker

`curl -sSL https://get.docker.com | sh`

Autostart on startup:

`sudo systemctl enable docker`

Give user permissions:

`sudo usermod -aG docker <username>`

Reboot, or `sudo systemctl start docker`

Install docker-compose:

```
apt-get install python-pip
pip install docker-compose
```

**3. Install this or another mongodb docker image made for the rapsberry pi** 

https://hub.docker.com/r/nonoroazoro/rpi-mongo/

`docker pull nonoroazoro/rpi-mongo`

**4.Rename the mongodb dockerfile to "mongo"**

If you use the above image:

`docker tag nonoroazoro/rpi-mongo mongo`

**6. Run zenbot**

```
cd zenbot
docker-compose build
docker-compose up -d
```

Commands are the same

`docker run --rm --link zenbot_mongodb_1:mongodb -it zenbot_server [command]`


