#!/bin/bash
echo "Starting new screen session..."
screen -d -m -S zenbotstest
screen -S zenbotstest -X screen wicked
screen -S zenbotstest -p 1 -X cd ~/repos/zenbot
screen -S zenbotstest -p 1 -X exec zenbot trade --conf config/btc_365.js --paper