#!/bin/bash
git clone https://github.com/carlos8f/zenbrain.git
git clone https://github.com/carlos8f/zenbot.git
cd zenbrain
npm install
sudo npm link
cd ../zenbot
git checkout 3.x
npm install
npm link zenbrain
rm -Rf /usr/local/bin/zenbot
sudo npm link
zenbot launch map --backfill reduce run ticker_server
