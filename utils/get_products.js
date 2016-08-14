module.exports = function container (get, set, clear) {
  var c = get('config')
  return function get_products (x) {
    return x.products.filter(function (product) {
      if (c.assets.indexOf(product.asset) === -1) return false
      return c.currencies.indexOf(product.currency) !== -1
    })
  }
}