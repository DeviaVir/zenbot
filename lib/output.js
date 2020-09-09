var path = require('path')

module.exports = function output (conf) {

  var initializeOutput = function(tradeObject) {
    for (var output in conf.output) {
      if (conf.output[output].on) {
        if (conf.debug) {
          console.log(`initializing output ${output}`)
        }
        require(path.resolve(__dirname, `../extensions/output/${output}`))(conf).run(conf.output[output], tradeObject)
      }
    }
  }

  return {
    initializeOutput: initializeOutput
  }
}
