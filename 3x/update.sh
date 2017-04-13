#!/bin/bash
git stash
RES=$?
git pull
npm install
npm install zenbrain
if [ "$RES" -eq "0" ];
then
  git stash pop
fi
