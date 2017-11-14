var convnetjs = require('convnetjs')
var z = require('zero-fill')
var stats = require('stats-lite')
var n = require('numbro')
var math = require('mathjs')
var cluster = require('cluster')
var numCPUs = require('os').cpus().length;
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

    },
    onPeriod: function (s, cb) {
    if (cluster.isMaster) {
     // Fork workers.
      for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
      }
      cluster.on('exit', function(worker, code, signal) {
      console.log('worker ' + worker.process.pid + ' died');
      });
    } else {

        // do the network thing
        var tlp = []
        var tll = []
        if (s.neural === undefined) {
            // Create the net the first time it is needed and NOT on every run
            s.neural = {
                net : new convnetjs.Net(),
                layer_defs : [
                    {type:'input', out_sx:1, out_sy:1, out_depth:s.options.depth},
                    {type:'fc', num_neurons:s.options.neurons_1, activation:s.options.activation_1_type},
                    {type:'regression', num_neurons:1}
                ],
                neuralDepth: s.options.depth,
            }
            s.neural.net.makeLayers(s.neural.layer_defs);
            s.neural.trainer = new convnetjs.SGDTrainer(s.neural.net, {learning_rate:0.01, momentum:s.options.momentum, batch_size:1, l2_decay:s.options.decay});
        }
        if (s.lookback[s.options.min_periods]) {
            for (let i = 0; i < s.options.min_periods; i++) { tll.push(s.lookback[i].close) }
            for (let i = 0; i < s.options.min_predict; i++) { tlp.push(s.lookback[i].close) }

            var my_data = tll.reverse()
            var learn = function () {
                for(var j = 0; j < 500; j++){
                    for (var i = 0; i < my_data.length - s.neural.neuralDepth; i++) {
                        var data = my_data.slice(i, i + s.neural.neuralDepth);
                        var real_value = [my_data[i + s.neural.neuralDepth]];
                        var x = new convnetjs.Vol(data);
                        s.neural.trainer.train(x, real_value);
                        var predicted_values = s.neural.net.forward(x);
                    }
                }
            }
            var predict = function(data){
                var x = new convnetjs.Vol(data);
                var predicted_value = s.neural.net.forward(x);
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
      }

        // NORMAL onPeriod STUFF here
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
