var path = require('path')

export default (conf) => {
  var initializeOutput = function(tradeObject) {
    for (var output in conf.output) {
      if (conf.output[output].on) {
        if (conf.debug) {
          console.log(`initializing output ${output}`)
        }
        require(path.resolve(__dirname, `../plugins/output/${output}`))
          .default(conf)
          .run(conf.output[output], tradeObject)
      }
    }
  }

  return {
    initializeOutput: initializeOutput,
  }
}
