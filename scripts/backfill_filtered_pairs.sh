#!/bin/bash

# Provide as argument how many days to backfill, otherwise default is 14
while read p; do
  echo "Backfilling $p with $1 days of data"
  env node zenbot.js backfill --days $1 $p
done <assets/filtered-pairs.txt
