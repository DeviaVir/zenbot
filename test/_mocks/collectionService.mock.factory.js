/*
        By default, returns a mock collection service, which has
        - a method getTrades(), which simulates two trade records in the DB
        - a method getResumeMarkers(), 
    */

module.exports = (opts) => {
  if (opts === undefined)
    opts = { }

  var tradesArray
  if (opts.tradesArray !== undefined && opts.tradesArray !== null)
    tradesArray = opts.tradesArray
  else
    tradesArray = [{id: 'stub.BTC-USD-3000', trade_id: 3000, time: 99992, selector: 'stub.BTC-USD' }, {id: 'stub.BTC-USD-3001', trade_id: 3001, time: 99994, selector: 'stub.BTC-USD'}]

  var resumeMarkersArray
  if (opts.resumeMarkersArray !== undefined && opts.resumeMarkersArray !== null)
    resumeMarkersArray = opts.resumeMarkersArray
  else
    resumeMarkersArray = [{from: 2994, to: 2998, oldest_time: 99960, newest_time: 99986}]

  var mockUpdateFunction
  if (opts.mockUpdateFunction !== undefined && opts.mockUpdateFunction !== null) 
    mockUpdateFunction = opts.mockUpdateFunction

  var mockDeleteManyFunction
  if (opts.mockDeleteManyFunction !== undefined && opts.mockDeleteManyFunction !== null) 
    mockDeleteManyFunction = opts.mockDeleteManyFunction

  var mockInsertManyFunction
  if (opts.mockInsertManyFunction !== undefined && opts.mockInsertManyFunction !== null) 
    mockInsertManyFunction = opts.mockInsertManyFunction

  var mockFindOneFunction
  if (opts.mockFindOneFunction !== undefined && opts.mockFindOneFunction !== null) 
    mockFindOneFunction = opts.mockFindOneFunction

  var findOneReturnTrade
  if (opts.findOneReturnTrade !== undefined && opts.findOneReturnTrade !== null) 
    findOneReturnTrade = opts.findOneReturnTrade

  var rtn = { 
    getTrades: () => { 
      return {
        findOne: (query) => { 
          if (mockFindOneFunction)
            mockFindOneFunction(query)

          return {
            then: (func) => {
              func(findOneReturnTrade)
            }
          }
        },
        find: () => { 
          return { 
            limit: (/* num */) => {
              return { 
                toArray: (func) => {
                  func(null, tradesArray)
                }
              }
            },
            toArray: (func) => { 
              func(null, tradesArray) 
            }
          }
        }, 
        insert: (trade) => { 
          return { 
            then: (cb/*, err*/) => { // TODO: should this be (err, cb) instead?
              cb(trade)
            }
          }
        },
      }},
    getResumeMarkers: () => { 
      return {
        find: () => { 
          return { 
            toArray: (func) => { 
              func(null, resumeMarkersArray) 
            }
          }
        }, 
        save: (doc, func) => {
          func(null, null)
        }, 
        update: (opts, doc, func) => {
          func(null, null)
          if (mockUpdateFunction)
            mockUpdateFunction(opts, doc, func)
        },
        deleteMany: (q, cb) => { cb(); if (mockDeleteManyFunction) mockDeleteManyFunction(q) },
        insertMany: (q, cb) => { cb(); if (mockInsertManyFunction) mockInsertManyFunction(q) }
      }
    }
  } // collection service


  return rtn
}