#### Debian-based OSes (complete guide)

Although this guide was initially created for Ubuntu 20.04, Also works with Debian.

```
sudo apt-get install curl python2 git build-essential mongodb nodejs

curl -sL https://deb.nodesource.com/setup_15.x | sudo -E bash -

sudo apt-get update
sudo apt-get upgrade -y

sudo apt-get install curl python2 git build-essential mongodb nodejs

git clone https://github.com/deviavir/zenbot.git
cd zenbot

npm install

./zenbot.sh --help
```

[Blog Post (Ubuntu 16.04)](https://jaynagpaul.com/algorithmic-crypto-trading?utm_source=zenbot)  
[Video (Ubuntu 16.04)](https://youtu.be/BEhU55W9pBI)  
