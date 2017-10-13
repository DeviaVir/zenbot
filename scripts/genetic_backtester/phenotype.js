/*
 * Zenbot 4 Genetic Backtester
 * Clifford Roche <clifford.roche@gmail.com>
 * 07/01/2017
 */

let PROPERTY_MUTATION_CHANCE = 0.30;
let PROPERTY_CROSSOVER_CHANCE = 0.50;

module.exports = {
  create: function(strategy) {
    var r = {};
    for (var k in strategy) {
      var v = strategy[k];
      if (v.type === 'int') {
        r[k] = Math.floor((Math.random() * (v.max - v.min + 1)) + v.min);
      } else if (v.type === 'int0') {
	r[k] = 0;
	if (Math.random() >= 0.5) {
	  r[k] = Math.floor((Math.random() * (v.max - v.min + 1)) + v.min);
	}
      } else if (v.type === 'float') {
        r[k] = (Math.random() * (v.max - v.min)) + v.min;
      } else if (v.type === 'makertaker') {
        r[k] = (Math.random() > 0.5) ? 'maker' : 'taker';
      } else if (v.type === 'period') {
        var s = Math.floor((Math.random() * (v.max - v.min + 1)) + v.min);
        r[k] = s + v.period;
      }
    }
    return r;
  },

  mutation: function(oldPhenotype, strategy) {
    var r = module.exports.create(strategy);
    for (var k in oldPhenotype) {
      if (k === 'sim') continue;

      var v = oldPhenotype[k];
      r[k] = (Math.random() < PROPERTY_MUTATION_CHANCE) ? r[k] : oldPhenotype[k];
    }
    return r;
  },

  crossover: function(phenotypeA, phenotypeB, strategy) {
    var p1 = {};
    var p2 = {};

    for (var k in strategy) {
      if (k === 'sim') continue;

      p1[k] = Math.random() >= PROPERTY_CROSSOVER_CHANCE ? phenotypeA[k] : phenotypeB[k];
      p2[k] = Math.random() >= PROPERTY_CROSSOVER_CHANCE ? phenotypeA[k] : phenotypeB[k];
    }

    return [p1, p2];
  },

  fitness: function(phenotype) {
    if (typeof phenotype.sim === 'undfined') return 0;
    
    var vsBuyHoldRate = (phenotype.sim.vsBuyHold / 50);
    var wlRatioRate = 1.0 / (1.0 + Math.pow(2.71828, -(phenotype.sim.wins - phenotype.sim.losses)));
    var rate = vsBuyHoldRate * (wlRatioRate);
    return rate;
  },

  competition: function(phenotypeA, phenotypeB) {
    // TODO: Refer to geneticalgorithm documentation on how to improve this with diverstiy
    return module.exports.fitness(phenotypeA) >= module.exports.fitness(phenotypeB);
  }
};
