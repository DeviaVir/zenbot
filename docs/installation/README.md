### Install Zenbot

Run in your console:
```
git clone https://github.com/deviavir/zenbot.git
```

Or, without git:
```
wget https://github.com/deviavir/zenbot/archive/master.tar.gz
tar -xf zenbot-master.tar.gz
mv zenbot-master zenbot
```

Create your configuration file by copying `conf-sample.js` to `conf.js`:
```
cp conf-sample.js conf.js
```

- View and edit `conf.js`.
- It's possible to use Zenbot in "paper trading" mode without making any changes.
- You must add your exchange API keys to enable real trading however.
- API keys do **not** need deposit/withdrawal permissions.

If using Docker, skip to the [Docker guide](docker.md).

Install dependencies:
```
cd zenbot
npm install
```

Optional:  
Install the `zenbot.sh` binary in `/usr/local/bin`:
```
npm link
```

Run a Zenbot command:
```
zenbot --help
```
