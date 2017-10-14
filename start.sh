#!/bin/bash
screen -d -m -S zenbots
for file in config/*.js
do
 # do something on $file
 echo "$file"
done
# # window 0 is created by default, show hello0 on it
# screen -S mysession -p 0 -X stuff hello0
for n in {1..9}; do
  echo haaai
done