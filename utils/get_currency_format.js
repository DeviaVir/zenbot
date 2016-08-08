module.exports = function (currency) {
  switch (currency) {
    case 'USD': return '$0,00.00';
    case 'EUR': return '€0,00.00';
    case 'CNY': return '元0,00.00';
    default: return '0.000'
  }
}