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
      this.option('period', 'period length - make sure to lower your poll trades time to lower than this value', String, '5s')
      this.option('trendtrades_1', "Trades to learn from and calculate mean from. (predixtion - mean > 0 = buy)", Number, 20)
      this.option('activation_1_type', "Neuron Activation Type: sigmoid, tanh, relu", String, 'sigmoid')
      this.option('neurons_1', "Neurons in layer 1", Number, 20)
      this.option('depth', "Rows of data to predict ahead for matches/learning", Number, 9)
      this.option('selector', "Selector", String, 'Gdax.BTC-USD')
      this.option('min_periods', "Set this to same as trendtrades_1", Number, 1000)
      this.option('start_trigger', "Minimum trades to start calculating after x trades load", Number, 1600
                 )
    },
    calculate: function (s) {
      get('lib.ema')(s, 'neural', s.options.neural)
      var tl1 = []
      // Soemething needs to be done about this line below, s.lookback.length is always too early.
      if (s.lookback[s.options.start_trigger]) {
          for (let i = 0; i < s.options.trendtrades_1; i++) { tl1.push(s.lookback[i].close) }
          // create a net out of it
          var net = new convnetjs.Net();
          var d = s.options.depth;
          var layer_defs = [];
          layer_defs.push({type:'input', out_sx:1, out_sy:1, out_depth:d});
          layer_defs.push({type:'fc', num_neurons:s.options.neurons_1, activation:s.options.activation_1_type});
          layer_defs.push({type:'regression', num_neurons:1});
          var net = new convnetjs.Net();
          net.makeLayers(layer_defs);
          var my_data = tl1
          var trainer = new convnetjs.SGDTrainer(net, {learning_rate:0.01, momentum:0.0, batch_size:1, l2_decay:0.001});

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
         var item = tl1;
         s.prediction = predict(item)
         s.sig = s.prediction - tl1[0]
        }
    },


    onPeriod: function (s, cb) {
        if (
            // for some reason I swapped this
            s.sig < 0
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
      cols.push(z(8, n(s.output).format('00000.0000'), ' ')[s.sig > 0 ? 'green' : 'red'])
      return cols
    },
  }
}
