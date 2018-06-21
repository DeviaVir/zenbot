/*
 * Zenbot 4 Genetic Backtester
 * Clifford Roche <clifford.roche@gmail.com>
 * 07/01/2017
 */

let PROPERTY_RANDOM_CHANCE = 0.30 // Chance of a Mutation to spawn a new species -- Try and prevent some stagnation
let PROPERTY_MUTATION_CHANCE = 0.30 // Chance of a Mutation in an aspect of the species
let PROPERTY_CROSSOVER_CHANCE = 0.50 // Chance of a aspect being inherited by another species


module.exports = {
  create: function(strategy) {
    var r = {}
    for (var k in strategy) {
      var v = strategy[k]
      if (v.type === 'int') {
        r[k] = Math.floor((Math.random() * (v.max - v.min + 1)) + v.min)
      } else if (v.type === 'int0') {
        r[k] = 0
        if (Math.random() >= 0.5) {
          r[k] = Math.floor((Math.random() * (v.max - v.min + 1)) + v.min)
        }
      } else if (v.type === 'intfactor') {
        let factorString = v.factor.toString(),
          decimalIdx = factorString.indexOf('.') + 1,
          decimals = decimalIdx === 0 ? 0 : factorString.length - decimalIdx
        r[k] = (Math.floor(Math.random() * (v.max - v.min + v.factor) / v.factor) * v.factor + v.min).toFixed(decimals)
      } else if (v.type === 'float') {
        r[k] = (Math.random() * (v.max - v.min)) + v.min
      } else if (v.type === 'period_length') {
        var s = Math.floor((Math.random() * (v.max - v.min + 1)) + v.min)
        r[k] = s + v.period_length
      } else if (v.type === 'listOption') {
        let index = Math.floor(Math.random() * v.options.length)
        r[k] = v.options[index]
      } else if (v.type === 'maType') {
        let items = ['SMA', 'EMA', 'WMA', 'DEMA', 'TEMA', 'TRIMA', 'KAMA', 'MAMA', 'T3']
        let index = Math.floor(Math.random() * items.length)
        r[k] = items[index]
      } else if (v.type === 'uscSignalType') {
        let items = ['simple', 'low', 'trend']
        let index = Math.floor(Math.random() * items.length)
        r[k] = items[index]
      }
    }
    return r
  },

  range: function(v, step, stepSize) {
    var scale = step / (stepSize - 1)

    if (v.type === 'int') {
      return Math.floor((scale * (v.max - v.min)) + v.min)
    } else if (v.type === 'int0') {
      if (step == 0)
        return 0

      scale = (step - 1) / (stepSize - 2)
      return Math.floor((scale * (v.max - v.min)) + v.min)
    } else if (v.type === 'intfactor') {
      let val = Math.floor((scale * (v.max - v.min)) + v.min)
      return Math.floor(val / v.factor) * v.factor
    } else if (v.type === 'float') {
      return (scale * (v.max - v.min)) + v.min
    } else if (v.type === 'period_length') {
      var s = Math.floor((scale * (v.max - v.min)) + v.min)
      return s + v.period_length
    } else if (v.type === 'listOption') {
      scale = step / stepSize
      let index = Math.floor(scale * v.options.length)
      return v.options[index]
    }
  },

  mutation: function(oldPhenotype, strategy) {
    var r = module.exports.create(strategy)
    if(Math.random() > PROPERTY_RANDOM_CHANCE) {
      for (var k in oldPhenotype) {
        if (k === 'sim') continue

        var v = oldPhenotype[k]
        r[k] = (Math.random() < PROPERTY_MUTATION_CHANCE) ? r[k] : v
      }
    }
    return r
  },

  crossover: function(phenotypeA, phenotypeB, strategy) {
    var p1 = {}
    var p2 = {}

    for (var k in strategy) {
      if (k === 'sim') continue
      if (k === 'minTrades') continue
      if (k === 'fitnessCalcType') continue

      p1[k] = Math.random() <= PROPERTY_CROSSOVER_CHANCE ? phenotypeA[k] : phenotypeB[k]
      p2[k] = Math.random() <= PROPERTY_CROSSOVER_CHANCE ? phenotypeA[k] : phenotypeB[k]
    }

    return [p1, p2]
  },

  fitness: function(phenotype) {
    if (typeof phenotype.sim === 'undefined') return 0
    let rate = 0
    if (phenotype.fitnessCalcType == 'profitwl')
    {
      let profit = phenotype.sim.profit + (phenotype.sim.assetCapital * phenotype.sim.lastAssestValue)
      // if minTrades is set use an alternate fitness calculation to hone in on a trade stratagy that has the minimum trade count
      // once found use the normal fitness strsategy to find the best parameters.
      if (phenotype.minTrades > 0) 
      {
        if (phenotype.sim.wins < phenotype.minTrades && phenotype.sim.wins == 0) return 0.0
        if (phenotype.sim.wins < phenotype.minTrades) return ((phenotype.sim.wins/phenotype.minTrades)+profit)/100
      }
      let wlRatio = phenotype.sim.wins / phenotype.sim.losses
      if (isNaN(wlRatio)) { // zero trades will result in 0/0 which is NaN
        wlRatio = 0
      }
      let wlRatioRate = 1.0 / (1.0 + Math.pow(Math.E,-wlRatio))
      rate = (profit * wlRatioRate )

    }
    else  if (phenotype.fitnessCalcType == 'profit')
    {
      //let profit = phenotype.sim.profit
      let profit = phenotype.sim.profit + (phenotype.sim.assetCapital * phenotype.sim.lastAssestValue)
      // if minTrades is set use an alternate fitness calculation to hone in on a trade stratagy that has the minimum trade count
      // once found use the normal fitness strsategy to find the best parameters.
      if (phenotype.minTrades > 0) 
      {
        if (phenotype.sim.wins < phenotype.minTrades && phenotype.sim.wins == 0) return 0.0
        if (phenotype.sim.wins < phenotype.minTrades) return ((phenotype.minTrades)+profit)/1000
      }

      rate = profit
    }  
    if (phenotype.fitnessCalcType == 'wl')
    {
      //let vsBuyHoldRate = phenotype.sim.profit 
      // if minTrades is set use an alternate fitness calculation to hone in on a trade stratagy that has the minimum trade count
      // once found use the normal fitness strsategy to find the best parameters.
      if (phenotype.minTrades > 0) 
      {
        if (phenotype.sim.wins < phenotype.minTrades && phenotype.sim.wins == 0) return 0.0
        if (phenotype.sim.wins < phenotype.minTrades) return (phenotype.sim.wins/phenotype.minTrades)/100
      }
      let wlRatio = phenotype.sim.wins / phenotype.sim.losses
      if (isNaN(wlRatio)) { // zero trades will result in 0/0 which is NaN
        wlRatio = 0
      }
      let wlRatioRate = 1.0 / (1.0 + Math.pow(Math.E,-wlRatio))
      rate = ( wlRatioRate )
    }
    else
    {

      let vsBuyHoldRate = ((phenotype.sim.vsBuyHold + 100) / 50)
      if (phenotype.minTrades > 0) 
      {
        if (phenotype.sim.wins < phenotype.minTrades && phenotype.sim.wins == 0) return 0.0
        if (phenotype.sim.wins < phenotype.minTrades) return ((phenotype.sim.wins/phenotype.minTrades)+vsBuyHoldRate)/100
      }
      let wlRatio = phenotype.sim.wins / phenotype.sim.losses
      if (isNaN(wlRatio)) { // zero trades will result in 0/0 which is NaN
        wlRatio = 1
      }
      let wlRatioRate = 1.0 / (1.0 + Math.pow(Math.E, -wlRatio))
      rate = vsBuyHoldRate * wlRatioRate
   
    }

    return rate
    
  },
  

  competition: function(phenotypeA, phenotypeB) {
    // TODO: Refer to geneticalgorithm documentation on how to improve this with diverstiy
    return module.exports.fitness(phenotypeA) >= module.exports.fitness(phenotypeB)
  },

  Range: function(min, max) {
    var r = {
      type: 'int',
      min: min,
      max: max
    }
    return r
  },

  Range0: function(min, max) {
    var r = {
      type: 'int0',
      min: min,
      max: max
    }
    return r
  },

  RangeFactor: function(min, max, factor) {
    var r = {
      type: 'intfactor',
      min: min,
      max: max,
      factor: factor
    }
    return r
  },

  RangeFloat: function(min, max) {
    var r = {
      type: 'float',
      min: min,
      max: max
    }
    return r
  },

  RangePeriod: function(min, max, period_length) {
    var r = {
      type: 'period_length',
      min: min,
      max: max,
      period_length: period_length
    }
    return r
  },

  RangeMaType: function() {
    var r = {
      type: 'listOption',
      options: ['SMA', 'EMA', 'WMA', 'DEMA', 'TEMA', 'TRIMA', 'KAMA', 'MAMA', 'T3']
    }
    return r
  },

  ListOption: function(options) {
    var r = {
      type: 'listOption',
      options: options
    }
    return r
  }

}