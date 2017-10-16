#!/bin/bash
echo "Starting new screen session..."
screen -d -m -S zenbotstest
screen -S zenbotstest -p 0 -X cd ~/repos/zenbot
screen -S zenbotstest -p 0 -X exec zenbot trade --conf config/btc_365.js --paper
screen -S zenbotstest -p 0 -X xdotool key ctrl+s
screen -S zenbotstest -p 0 -X xdotool key shift+a
screen -S zenbotstest -p 0 -X xdotool key BackSpace BackSpace BackSpace BackSpace
screen -S zenbotstest -p 0 -X xdotool type "$file"
screen -S zenbotstest -p 0 -X xdotool key Enter