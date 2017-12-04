module.exports = function container (get) {
  var c = get('conf')

  var initializeOutput = function(tradeObject) {
    for (var output in c.output) {
      if (c.output[output].on) {
        if (c.debug) {
          console.log(`initializing output ${output}`)
        }
        get(`output.${output}`).run(c.output[output], tradeObject)
      }
    }
  }

  return {
    initializeOutput: initializeOutput
  }
}
