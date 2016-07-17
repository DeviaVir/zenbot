module.exports = function container (get, set, clear) {
  return function mapreduce (options) {
    console.log('map/reduce')
  }
}