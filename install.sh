#!/bin/bash
rm -Rf zenbot
git clone https://github.com/carlos8f/zenbot.git
cd zenbot
git checkout 3.x
npm install
sudo rm -Rf /usr/local/bin/zenbot
sudo npm link
zenbot launch map --backfill reduce run ticker_server
