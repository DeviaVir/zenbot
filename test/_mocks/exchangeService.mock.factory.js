/*
        By default, returns a mock exchange service, which has
        a backward history scan, and returns two mock trades.
    */

module.exports = (opts) => {
  var selectorObject = {normalized: 'stub.BTC-USD', exchange_id: 'stub', asset: 'BTC', currency: 'USD' }
        
  if (opts === undefined) 
    opts = { }

  var rtn = {
    BACKWARD: 'backward',
    FORWARD: 'forward',
    getSelector: () => { return selectorObject },
    getExchange: undefined
  } // exchange service
  
  var getTradesOptionsObservingFunc
  if (opts.getTradesOptionsObservingFunc !== undefined && opts.getTradesOptionsObservingFunc !== null) 
    getTradesOptionsObservingFunc = opts.getTradesOptionsObservingFunc
 
  var tradesArray = [{id: 'stub.BTC-USD-3000', trade_id: 3000, time: 99992 }, {id: 'stub.BTC-USD-3001', trade_id: 3001, time: 99994}]
  if (opts.tradesArray !== undefined && opts.tradesArray !== null) 
    tradesArray = opts.tradesArray
  if (opts.exchangeTradesArray !== undefined && opts.exchangeTradesArray !== null)
    tradesArray = opts.exchangeTradesArray

  var getTradesFunc
  if (opts.getTradesFunc !== undefined && opts.getTradesFunc !== null)
    getTradesFunc = opts.getTradesFunc
  else
    getTradesFunc = (opts, func) => {
      if (typeof getTradesOptionsObservingFunc == 'function')
        getTradesOptionsObservingFunc(opts)
    
      func(null, tradesArray) 
    }

  var direction = opts.direction || 'backward'

  rtn.getExchange = () => {
    return {
      historyScan: direction,
      historyScanUsesTime: opts.historyScanUsesTime,
      getTrades: getTradesFunc 
    }
  }

  return rtn
}