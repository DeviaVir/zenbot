#!/usr/bin/env bash
echo "removing node_modules/forex.analytics/.git"
rm -rf node_modules/forex.analytics/.git
echo "bundling WebApp components"
webpack -p
echo "installing genetic_backtester components"
cd scripts/genetic_backtester/ && npm i
