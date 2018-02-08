
module.exports = (opts) => {
  if (opts === undefined) {
    opts = { }
  }

  if (opts.onSuccessFunc === undefined)
    opts.onSuccessFunc = (cb) => { cb( {trade_id: 3001} ) }

  var rtn = {
    setOnConsumeFunc: () => { },
    setOnProcessFunc: () => { },
    setAfterOnConsumeFunc: () => { },
    setAfterOnProcessFunc: () => { },
    go: () => { 
      return {
        then: (cb /*, err*/) => { opts.onSuccessFunc(cb) }
      }}
  }

  return rtn
}