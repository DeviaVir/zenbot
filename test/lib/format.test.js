let { formatAsset, formatCurrency, formatPercent } = require('../../lib/format')

describe('Format', () => {
  describe('formatAsset', () => {
    it('formats assets as expected', () => {
      expect(formatAsset(5, 'USD')).toBe('5.00000000 USD')
    })
  })
  describe('formatCurrency', () => {
    it('formats currency as expected', () => {
      expect(formatCurrency(1000, 'USD')).toBe('1000.00 USD')
      expect(formatCurrency(100, 'THING')).toBe('100.000 THING')
      expect(formatCurrency(1, 'GBP')).toBe('1.00000 GBP')
      expect(formatCurrency(0.008, 'XRP')).toBe('0.00800000 XRP')
      expect(formatCurrency(10, 'USD', true)).toBe('10.0000')
      expect(formatCurrency(10, 'USD', false, false, true)).toBe('10.0000 USD')
    })
  })
  describe('formatPercent', () => {
    it('formats percentages as expected', () => {
      expect(formatPercent(0.1)).toBe('+10.00%')
      expect(formatPercent(-0.03)).toBe('-3.00%')
      expect(formatPercent(0.0005)).toBe('+0.05%')
    })
  })
})