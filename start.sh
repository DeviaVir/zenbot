#!/bin/bash
echo "Starting new screen session..."
screen -d -m -S zenbotstest
windowCount=0
for file in config/*.js
do
 echo "Starting bot window with $file..."
 if [ $windowCount -ne 0 ]; then
 	screen -S zenbotstest -X screen
 fi
	screen -S zenbotstest -p $windowCount -X cd ~/repos/zenbot
	screen -S zenbotstest -p $windowCount -X exec zenbot trade --conf $file --paper
	# screen -S zenbotstest -p $windowCount -X xdotool key ctrl+s
	# screen -S zenbotstest -p $windowCount -X xdotool key shift+a
	# screen -S zenbotstest -p $windowCount -X xdotool key BackSpace BackSpace BackSpace BackSpace
	# screen -S zenbotstest -p $windowCount -X xdotool type "$file"
	((windowCount++))
done