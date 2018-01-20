var shell = require('shelljs')

console.log('removing node_modules/forex.analytics/.git')
shell.rm('-rf', 'node_modules/forex.analytics/.git')
console.log('bundling WebApp components')
shell.exec('webpack -p')
console.log('installing genetic_backtester components')
shell.exec('(cd scripts/genetic_backtester/ && npm i)')
