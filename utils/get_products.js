module.exports = function container (get, set, clear) {
  var config = get('config')
  return function get_products (exchange) {
    return exchange.products.filter(function (product) {
      return product.asset === config.asset && product.currency === config.currency
    })
  }
}