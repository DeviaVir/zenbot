#!/bin/bash
git clone https://github.com/carlos8f/zenbot.git
cd zenbot
git checkout 3.x
git pull
npm install
npm install zenbrain
sudo rm -Rf /usr/local/bin/zenbot
sudo npm link
./run.sh
