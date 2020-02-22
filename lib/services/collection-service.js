module.exports = function (conf) {
  return {
    getTrades: () => {
      conf.db.mongo.collection('trades').createIndex({selector: 1, time: 1})
      return conf.db.mongo.collection('trades')
    },	

    getResumeMarkers: () => {
      conf.db.mongo.collection('resume_markers').createIndex({selector: 1, to: -1})
      return conf.db.mongo.collection('resume_markers')
    },

    getBalances: () => {
      return conf.db.mongo.collection('balances')
    },

    getSessions: () => {
      return conf.db.mongo.collection('sessions')
    },

    getPeriods: () => {
      return conf.db.mongo.collection('periods')
    },

    getMyTrades: () => {
      return conf.db.mongo.collection('my_trades')
    },

    getSimResults: () => {
      return conf.db.mongo.collection('sim_results')
    }
  }
}

