#### Debian-based OSes (complete guide)

Although this guide was initially created for Ubuntu 16.04, it is reported to also work on newer Ubuntu versions and Debian.

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

**Note:** `npm link` will not work as forex.analytics is built from source.

[Blog Post (Ubuntu 16.04)](https://jaynagpaul.com/algorithmic-crypto-trading?utm_source=zenbot)  
[Video (Ubuntu 16.04)](https://youtu.be/BEhU55W9pBI)  
