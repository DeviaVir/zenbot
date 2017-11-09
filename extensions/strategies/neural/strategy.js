var convnetjs = require('convnetjs');           
var z = require('zero-fill')            
var stats = require('stats-lite')               
var n = require('numbro')               
var math = require('mathjs');           
module.exports = function container (get, set, clear) {         
  return {              
    name: 'neural',             
    description: 'Trade when % change from last two 1m periods is higher than average.',                
    getOptions: function () {           
      this.option('period', 'period length', String, '10s')             
      this.option('trendtrades_1', "Trades to learn from", Number, 1000)
      this.option('trains', "Number of trains on data", Number, 1000)
      this.option('neurons', "Number of neurons on data", Number, 1000)
      this.option('depth', "I cannot let you do that, dave, dont change this.", Number, 2)
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
          layer_defs.push({type:'fc', num_neurons:s.options.neurons, activation:'sigmoid'});            
          layer_defs.push({type:'regression', num_neurons:1});          
          var net = new convnetjs.Net();                
          net.makeLayers(layer_defs);           
                
          var my_data = tl1             
                
                
                
         var trainer = new convnetjs.SGDTrainer(net, {learning_rate:0.01, momentum:0.2, batch_size:1, l2_decay:0.001});         
                
         var learn = function () {             
             for(var j = 0; j < s.options.trains; j++) {			                
 -               for(var i = 0; i < my_data.length - d; i++) {
                 var data = my_data.slice(i, i + d);            
                 var real_value = [my_data[i + d]];             
                 var x = new convnetjs.Vol(data);
                 trainer.train(x, real_value);          
             }
           }
         var predicted_values = net.forward(x);         
         s.value = predicted_values.w[0]                
         }              
         learn();                       
         console.log(s.value)
         s.sig = s.value - math.mean(tl1)               
  }             
},              
    onPeriod: function (s, cb) {                
            if (                
                  s.sig > 0             
               ) {              
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
      cols.push(z(s.signal, ' ')[s.signal === false ? 'red' : 'green'])         
            return cols         
      },                
    }           
  }
