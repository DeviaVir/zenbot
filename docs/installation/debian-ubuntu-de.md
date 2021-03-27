#### Debian-basierte Betriebssysteme (vollständige Anleitung)

Obwohl dieses Handbuch ursprünglich für Ubuntu 16.04 erstellt wurde, soll es auch mit neueren Ubuntu-Versionen und Debian funktionieren.

```
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -

sudo apt-get update
sudo apt-get upgrade -y

sudo apt-get install -y git build-essential mongodb nodejs

git clone https://github.com/deviavir/zenbot.git
cd zenbot

npm install

./zenbot.sh --help
```


```
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -

sudo apt-get update
sudo apt-get upgrade -y

sudo apt-get install -y git build-essential mongodb nodejs

git clone https://github.com/dwhr-pi/zenbot.git
cd zenbot

npm install

./zenbot.sh --help
```


[Blog Post (Ubuntu 16.04)](https://jaynagpaul.com/algorithmic-crypto-trading?utm_source=zenbot)  
[Video (Ubuntu 16.04)](https://youtu.be/BEhU55W9pBI)  
