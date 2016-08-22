module.exports = function container (get, set, clear) {
  return function get_products (x) {
    var c = get('config')
    if (c.watch_exchanges.indexOf(x.name) === -1) return []
    return x.products.filter(function (product) {
      if (c.assets.indexOf(product.asset) === -1) return false
      return c.currencies.indexOf(product.currency) !== -1
    })
  }
}