module.exports = function container (get, set, clear) {
  var c = get('conf')
  return function (strategy_file) {
    if (strategy_file) {
      strategy_file = path.resolve(process.cwd(), strategy_file)
    }
    else {
      strategy_file = c.default_strategy
    }
    return require(strategy_file)
  }
}