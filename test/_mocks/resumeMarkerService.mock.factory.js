module.exports = (opts) => {

  if (opts === undefined) 
    opts = { }

  if (opts.tradeFunction === undefined)
    opts.tradeFunction = (tradeId) => {
      return tradeId
    }

  return {
    isInRange: () => { return false },
    ping: opts.tradeFunction,
    load: (cb) => { cb() },
    flush: (cb) => { cb() }
  }
  // resume-marker service

}