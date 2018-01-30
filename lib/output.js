module.exports = function output (conf) {

  var initializeOutput = function(tradeObject) {
    for (var output in conf.output) {
      if (conf.output[output].on) {
        if (conf.debug) {
          console.log(`initializing output ${output}`)
        }
        require(`../extensions/output/${output}`).run(conf.output[output], tradeObject)
      }
    }
  }

  return {
    initializeOutput: initializeOutput
  }
}
