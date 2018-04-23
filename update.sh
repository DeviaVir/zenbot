#!/bin/bash
# the below will work assuming no other custom modifications have been made.
rm -rf node_modules/
git checkout package.json package-lock.json
git pull
npm install && npm update && npm dedupe
