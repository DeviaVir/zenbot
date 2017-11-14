var convnetjs = require('convnetjs');
var z = require('zero-fill')
var stats = require('stats-lite')
var n = require('numbro')
var math = require('mathjs');
// the below line starts you on a sell signal
var bought = 'bought'
// the beow line is for calculating the last mean vs the now mean.
var oldmean = 0
module.exports = function container (get, set, clear) {
  return {
    name: 'neural',
    description: 'Use neural learning to predict future price. Buy = mean(last 3 real prices) < mean(current & last prediction)',
    getOptions: function () {
      this.option('period', 'period length - make sure to lower your poll trades time to lower than this value', String, '5s')
      this.option('activation_1_type', "Neuron Activation Type: sigmoid, tanh, relu", String, 'sigmoid')
      this.option('neurons_1', "Neurons in layer 1 Shoot for atleast 100", Number, 5)
      this.option('depth', "Rows of data to predict ahead for matches/learning", Number, 1)
      this.option('selector', "Selector", String, 'Gdax.BTC-USD')
      this.option('min_periods', "Periods to calculate learn from", Number, 25)
      this.option('min_predict', "Periods to predict next number from", Number, 3)
      this.option('momentum', "momentum of prediction", Number, 0.2)
      this.option('decay', "decay of prediction, use teeny tiny increments", Number, 0)
    },
    calculate: function (s) {
      get('lib.ema')(s, 'neural', s.options.neural)
      var tlp = []
      var tll = []
      if (s.lookback[s.options.min_periods]) {
          for (let i = 0; i < s.options.min_periods; i++) { tll.push(s.lookback[i].close) }
          for (let i = 0; i < s.options.min_predict; i++) { tlp.push(s.lookback[i].close) }
          // create a net out of it
          var net = new convnetjs.Net();
          var d = s.options.depth;
          var layer_defs = [];
          layer_defs.push({type:'input', out_sx:1, out_sy:1, out_depth:d});
          // add another fc layer for more neurons
          layer_defs.push({type:'fc', num_neurons:s.options.neurons_1, activation:s.options.activation_1_type});
          // keep regression neurons at 1 otherwise error
          layer_defs.push({type:'regression', num_neurons:1});
          var net = new convnetjs.Net();
          net.makeLayers(layer_defs);
          var my_data = tll.reverse()
          var trainer = new convnetjs.SGDTrainer(net, {learning_rate:0.01, momentum:s.options.momentum, batch_size:1, l2_decay:s.options.decay});
          var learn = function () {
             for(var j = 0; j < 100; j++){
                 for (var i = 0; i < my_data.length - d; i++) {
                   var data = my_data.slice(i, i + d);
                   var real_value = [my_data[i + d]];
                   var x = new convnetjs.Vol(data);
                   trainer.train(x, real_value);
                   var predicted_values = net.forward(x);
                 }
             }
         }
          var predict = function(data){
            var x = new convnetjs.Vol(data);
            var predicted_value = net.forward(x);
            return predicted_value.w[0];
          }
         learn();
         var item = tlp.reverse();
         s.prediction = predict(item)
         s.mean = math.mean(tll[0], tll[1], tll[2])
         s.meanp = math.mean(s.prediction, oldmean)
         s.sig0 = s.meanp > s.mean
         oldmean = s.prediction
         }
    },
    onPeriod: function (s, cb) {
        if (
           s.sig0 === false
           )
           {
            s.signal = 'sell'
           }
        else if
           (
           s.sig0 === true
           )
           {
           s.signal = 'buy'
           }
      cb()
    },
    onReport: function (s) {
      cols = []
      cols.push(z(8, n(s.mean).format('0000.00'), ' ')[s.meanp > s.mean ? 'green' : 'red'])
      cols.push(z(8, n(s.meanp).format('0000.00'), ' ')[s.meanp > s.mean ? 'green' : 'red'])
      return cols
    },
  }
}


