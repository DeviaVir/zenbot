/**
 * Extract int from string input eg (SMA = 0)
 *
 * @see https://github.com/oransel/node-talib
 * @see https://github.com/markcheno/go-talib/blob/master/talib.go#L20
 */
export const getMaTypeFromString = (maType) => {
  // no constant in lib?

  switch (maType.toUpperCase()) {
    case 'SMA':
      return 0
    case 'EMA':
      return 1
    case 'WMA':
      return 2
    case 'DEMA':
      return 3
    case 'TEMA':
      return 4
    case 'TRIMA':
      return 5
    case 'KAMA':
      return 6
    case 'MAMA':
      return 7
    case 'T3':
      return 8
    default:
      return 0
  }
}
