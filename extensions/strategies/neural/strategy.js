var convnetjs = require('convnetjs');
var z = require('zero-fill')
var stats = require('stats-lite')
var n = require('numbro')
var math = require('mathjs');
module.exports = function container (get, set, clear) {
  return {
    name: 'neural',
    description: 'Use neural learning to predict future price.',
    getOptions: function () {
      this.option('period', 'period length', String, '30s')
      this.option('trendtrades_1', "Trades to learn from and calculate mean from. (predixtion - mean > 0 = buy)", Number, 1000)
      this.option('trains', "Don't change this / N/A", Number, 1)
      this.option('activation_1_type', "Neuron Activation Type: sigmoid, tanh, relu", String, 'sigmoid')
      this.option('neurons_1', "Neurons in layer 1", Number, 50)
      this.option('activation_2_type', "Neuron Activation Type: sigmoid, tanh, relu", String, 'sigmoid')
      this.option('neurons_2', "Neurons in layer 2", Number, 50)
      this.option('activation_3_type', "Neuron Activation Type: sigmoid, tanh, relu", String, 'sigmoid')
      this.option('neurons_3', "Neurons in layer 3", Number, 50)
      this.option('depth', "Don't change this / N/A", Number, 1)
      this.option('selector', "Selector", String, 'Gdax.BTC-USD')
      this.option('min_periods', "Set this to greater than trendtrades_1", Number, 1250)
    },
    calculate: function (s) {
      get('lib.ema')(s, 'neural', s.options.neural)
      var tl1 = []
      if (s.lookback[s.options.min_periods]) {
          for (let i = 0; i < s.options.trendtrades_1; i++) { tl1.push(s.lookback[i].close) }
          // create a net out of it
          var net = new convnetjs.Net();
          var d = s.options.depth;
          var layer_defs = [];
          layer_defs.push({type:'input', out_sx:1, out_sy:1, out_depth:d});
          layer_defs.push({type:'fc', num_neurons:s.options.neurons_1, activation:s.options.activation_1_type});
          layer_defs.push({type:'fc', num_neurons:s.options.neurons_2, activation:s.options.activation_2_type});
          layer_defs.push({type:'fc', num_neurons:s.options.neurons_3, activation:s.options.activation_3_type});
          layer_defs.push({type:'regression', num_neurons:1});
          var net = new convnetjs.Net();
          net.makeLayers(layer_defs);
          var my_data = tl1.reverse()
          var trainer = new convnetjs.SGDTrainer(net, {learning_rate:0.01, momentum:0.2, batch_size:1, l2_decay:0.001});

          var learn = function () {
             for(var j = 0; j < s.options.trains; j++) {
                 for(var i = 0; i < my_data.length - d; i++) {
                 var data = my_data.slice(i, i + d);
                 var real_value = [my_data[i + d]];
                 var x = new convnetjs.Vol(data);
                 trainer.train(x, real_value);
             }
             var predicted_values = net.forward(x);
             s.value = predicted_values.w[0]
           }
         }
         learn();
         s.sig = s.value - math.mean(tl1)
  }
},
    onPeriod: function (s, cb) {
        if (
            s.sig > 0
           )
           {
            s.signal = 'buy'
           }
        else
           {
           s.signal = 'sell'
           }
      cb()
    },

    onReport: function (s) {
      var cols = []
      cols.push(z(8, n(s.value).format('00000.0000'), ' ')[s.sig > 0 ? 'green' : 'red'])
      return cols
    },
  }
}
