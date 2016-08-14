#!/bin/bash
git clone https://github.com/carlos8f/zenbot.git
cd zenbot
git pull
npm install
sudo rm -Rf /usr/local/bin/zenbot
sudo npm link
