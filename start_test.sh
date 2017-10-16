#!/bin/bash
echo "Starting new screen session..."
screen -d -m -S zenbotstest
screen -S zenbotstest -X cd ~/repos/zenbot
screen -S zenbotstest -X exec zenbot trade --conf config/btc_365.js --paper
screen -S zenbotstest -X xdotool key ctrl+s
screen -S zenbotstest -X xdotool key shift+a
screen -S zenbotstest -X xdotool key BackSpace BackSpace BackSpace BackSpace
screen -S zenbotstest -X xdotool type "$file"
screen -S zenbotstest -X xdotool key Enter