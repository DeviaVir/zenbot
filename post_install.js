var shell = require('shelljs')

console.log('bundling WebApp components')
shell.exec('webpack --mode production')
console.log('installing genetic_backtester components')
shell.exec('(cd scripts/genetic_backtester/ && npm i)')
