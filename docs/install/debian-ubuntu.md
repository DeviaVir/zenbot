### Step-by-step for Debian-based OSes

Although this guide was initially created for Ubuntu 16.04, it is reported to also work on newer Ubuntu versions and Debian.

[Video (Ubuntu 16.04)](https://youtu.be/BEhU55W9pBI) & [Blog Post (Ubuntu 16.04)](https://jaynagpaul.com/algorithmic-crypto-trading?utm_source=zenbot)

```
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install build-essential mongodb -y

curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs

git clone https://github.com/deviavir/zenbot.git
cd zenbot
npm install

./zenbot.sh trade --paper
```
Please note: npm link will not work as forex.analytics is built from source.

