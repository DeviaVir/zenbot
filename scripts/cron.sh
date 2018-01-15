#!/bin/sh

setup_git() {
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "Travis CI"
}

run_cron() {
  for f in extensions/exchanges/*/update-products.sh;
  do
    echo "processing ${f}"
    ./${f}
  done

  git add .
  git commit --message "Exchanges: update-products $TRAVIS_BUILD_NUMBER"
}

upload_files() {
  git remote add upstream https://${GH_TOKEN}@github.com/DeviaVir/zenbot.git > /dev/null 2>&1
  git push --quiet --set-upstream upstream unstable
}

setup_git
run_cron
upload_files
