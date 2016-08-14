module.exports = function container (get, set, clear) {
  return function tick_defaults () {
    return {
      volume: 0,
      count: 0,
      buy_count: 0,
      buy_volume: 0,
      buy_ratio: null,
      side: null,
      side_volume: null,
      open: null,
      open_time: null,
      high: null,
      low: null,
      close: null,
      close_time: null,
      typical_price: null
    }
  }
}