#!/bin/bash
echo "Starting new screen session..."
screen -d -m -S zenbotstest
screen -S zenbotstest -p $windowCount -X cd ~/repos/zenbot
screen -S zenbotstest -p $windowCount -X exec zenbot trade --conf config/btc_365.js --paper
screen -S zenbotstest -p $windowCount -X xdotool key ctrl+s
screen -S zenbotstest -p $windowCount -X xdotool key shift+a
screen -S zenbotstest -p $windowCount -X xdotool key BackSpace BackSpace BackSpace BackSpace
screen -S zenbotstest -p $windowCount -X xdotool type "$file"
screen -S zenbotstest -p $windowCount -X xdotool key Enter