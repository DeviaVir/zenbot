var n = require('numbro')

module.exports = function (val, currency) {
  var culture = n.culture()
  var ret
  switch (currency) {
    case 'USD': n.setCulture('en-US'); break;
    case 'EUR': n.setCulture('fr-FR'); break;
    case 'CNY': n.setCulture('zh-CN'); break;
    case 'BTC': return n(val).format('0.00000000')
    default: return n(val).format('0.000');
  }
  ret = n(val).formatCurrency('$,0.00')
  n.setCulture(culture)
  return ret
}