var convnetjs = require('convnetjs');
var z = require('zero-fill')
var stats = require('stats-lite')
var n = require('numbro')
var math = require('mathjs');
module.exports = function container (get, set, clear) {
  return {
    name: 'neural',
    description: 'Use neural learning to predict future price. Starts when min_period lasts longer than backfill.',
    getOptions: function () {
      this.option('period', 'period length - make sure to lower your poll trades time to lower than this value', String, '1s')
      this.option('activation_1_type', "Neuron Activation Type: sigmoid, tanh, relu", String, 'sigmoid')
      this.option('neurons_1', "Neurons in layer 1", Number, 10)
      this.option('depth', "Rows of data to predict ahead for matches/learning", Number, 9)
      this.option('selector', "Selector", String, 'Gdax.BTC-USD')
      this.option('min_periods', "Periods to calculate learn from", Number, 10000)
      this.option('min_predict', "Periods to predict next number from", Number, 10)
      this.option('momentum', "momentum of prediction", Number, 0.2)
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
          layer_defs.push({type:'regression', num_neurons:1});
          var net = new convnetjs.Net();
          net.makeLayers(layer_defs);
          // Array must be reversed to get next value to train
          var my_data = tll.reverse()
          var trainer = new convnetjs.SGDTrainer(net, {learning_rate:0.01, momentum:s.options.momentum, batch_size:1, l2_decay:0.001});
          var learn = function () {
             for(var j = 0; j < 10; j++){
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
         // again, array must be reversed.
         var item = tlp.reverse();
         s.prediction = predict(item)
         s.sig = s.prediction < tlp[0] ? 'True' : 'False'
         }
    },
    onPeriod: function (s, cb) {
        if (
           s.sig === 'False'
           && s.bought === 'bought'
           )
           {
            s.signal = 'sell'
            s.bought = 'sold'

           }
        else if
           (
           s.sig === 'True'
           )
           {
           s.signal = 'buy'
           s.bought = 'bought'
           }
      cb()
    },
    onReport: function (s) {
      var cols = []
      cols.push(z(8, n(s.prediction).format('00000.0000'), ' ')[s.sig === 'True' ? 'green' : 'red'])
      return cols
    },
  }
}
