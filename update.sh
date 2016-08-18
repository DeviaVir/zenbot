#!/bin/bash
git stash
git pull
npm install
npm install zenbrain
git stash pop
