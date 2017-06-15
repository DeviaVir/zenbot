var z = require('zero-fill')
, n = require('numbro')
, deepqlearn = require('../../../node_modules/convnetjs/build/deepqlearn.js')
, convnetjs = require('convnetjs')
, fs = require('fs')

module.exports = function container (get, set, clear) {
  return {
    name: 'deep_net0',
    description: 'Deep net - v0',


    getOptions: function () {
      this.option('period', 'period length in  minutes', String, '1h')
      //this.option('min_periods', 'min. number of history periods', Number, 200)


      this.option('brain', 'Brain object container', Object, null)
      this.option('states', 'States container array', Object, null)
      this.option('input_buffer_size', 'History buffer size, that should be used while learning', Number, 200)
      this.option('min_lookback', 'Minimum lookback buffer needed before simulation start', Number, 1)
      this.option('model', 'Path to pre-trained model', String, null)
      this.option('saved_since_ticker', 'Incremental ticker since last save', Number, 0)
      this.option('save_every_x', 'Save every x tick', Number, 1000)

      // working variables
      this.option('last_close_price', 'Last closing price (working variable)', Number, 0)


      /*
      // History containers
      this.option('ma10_prev', '', Number, 0)
      this.option('ma30_prev', '', Number, 0)
      this.option('ma60_prev', '', Number, 0)
      this.option('ma90_prev', '', Number, 0)
      this.option('ma150_prev', '', Number, 0)
      this.option('ma360_prev', '', Number, 0)

      this.option('hold', 'Hold', Number, 0)
      this.option('model', 'Path to pre-trained model', String, null)
      this.option('order_finished', 'Indicator whether the order was finished', Boolean, true)
      this.option('last_action', 'Indicator whether the order was finished', String, null)

      this.option('ticker_timeout_limit', 'How long the bot can go without checking new actions', Number, 10)
      this.option('ticker', 'Value of previous profit', Number, 0)
      this.option('ticker_expired', 'Value of previous profit', Boolean, false)

      this.option('previous_profit', 'Value of previous profit', Number, 0)
      this.option('prev_mode', 'Prev mode', Number, 0)
      this.option('data_ready', 'Data ready', Boolean, false)
      this.option('holding_currency', 'Holding currency indicator', Boolean, false)
      this.option('holding_assets', 'Holding assets indicator', Boolean, false)

      this.option('saved_since_ticker', 'Incremental ticker since last save', Number, 0)
      this.option('save_every_x', 'Save every x tick', Number, 1000)

      //this.option('floor_coef', 'floor coefficient', Number, 0.75)
      //this.option('moon_coef', 'moon coefficient', Number, 1.05)
      //this.option('resistance_coef', 'resistance coefficient', Number, 2.8)
      */

      /*
      this.option('ema_short_period', 'number of periods for the shorter EMA', Number, 12)
      this.option('ema_long_period', 'number of periods for the longer EMA', Number, 26)
      this.option('signal_period', 'number of periods for the signal EMA', Number, 9)
      this.option('up_trend_threshold', 'threshold to trigger a buy signal', Number, 0)
      this.option('down_trend_threshold', 'threshold to trigger a sold signal', Number, 0)
      this.option('overbought_rsi_periods', 'number of periods for overbought RSI', Number, 25)
      this.option('overbought_rsi', 'sold when RSI exceeds this value', Number, 70)
      */
    },


    initialize: function(s){

      function loadnet(brain, file) {
        var dataNet = fs.readFileSync('value_net.json', 'utf8')
        var j = JSON.parse(dataNet);
        s.options.brain.value_net.fromJSON(j);
        brain.learning = false; // stop learning
      }

      // General settins
      s.options.states = []
      s.options.min_lookback = s.options.input_buffer_size


      // Initialize deep-net
      var layer_defs = [];
      var num_inputs = s.options.input_buffer_size
      var num_actions = 3     // 3 possible actions (buy, sell, hold)
      var temporal_window = 1 // amount of temporal memory. 0 = agent lives in-the-moment :)
      var network_size = num_inputs*temporal_window + num_actions*temporal_window + num_inputs
      layer_defs.push({type:'input', out_sx:1, out_sy:1, out_depth:network_size});
      //layer_defs.push({type:'fc', num_neurons: 200, activation:'relu'});
      layer_defs.push({type:'fc', num_neurons: 100, activation:'relu'});
      layer_defs.push({type:'fc', num_neurons: 50, activation:'relu'});
      layer_defs.push({type:'regression', num_neurons: num_actions});


      /*
      layer_defs.push({type:'input', out_sx:1, out_sy:1, out_depth:network_size});
      layer_defs.push({type:'fc', num_neurons: 50, activation:'relu'});
      layer_defs.push({type:'fc', num_neurons: 50, activation:'relu'});
      layer_defs.push({type:'regression', num_neurons: num_actions});
      */
      // options for the Temporal Difference learner that trains the above net
      // by backpropping the temporal difference learning rule.
      var tdtrainer_options = {learning_rate:0.0003, momentum:0.0, batch_size:64, l2_decay:0.01};
      var opt = {};
      opt.temporal_window = temporal_window;
      // size of experience replay memory
      opt.experience_size = 30000;
      // number of examples in experience replay memory before we begin learning
      opt.start_learn_threshold = 1000;
      // gamma is a crucial parameter that controls how much plan-ahead the agent does. In [0,1]
      opt.gamma = 0.8;
      opt.learning_steps_total = 200000;
      // how many steps of the above to perform only random actions (in the beginning)?
      opt.learning_steps_burnin = 3000;
      opt.epsilon_min = 0.05;
      opt.epsilon_test_time = 0.05;
      opt.layer_defs = layer_defs;
      opt.tdtrainer_options = tdtrainer_options;
      s.options.brain = new deepqlearn.Brain(num_inputs, num_actions, opt)

      if(s.options.model){
      loadnet(s.options.brain, s.options.model)
    }

  },


  /* Called every time when a trade was done
  (for example if in 5min period was done 20 trades, the method will be called 20 times)
  */
  calculate: function (s) {
    if(!s.options.brain)
    this.initialize(s)

    return;
  },

  onPeriod: function (s, cb) {

    // Wait until we get all the samples that we need
    if(s.lookback.length <= s.options.min_lookback){
      if(s.lookback.length > 0){
        s.options.states.push(s.period.close - s.options.last_close_price)
        //s.options.last_close_price = s.period.close
      }
      s.options.last_close_price = s.period.close
      cb()
      return
    }


    //console.log('calculating...', s.period.period_id, '--', s.period.volume)
    // get current ticker data
    //get('lib.ema')(s, 'ma2', 2/periodInMinutes)

    s.options.states.pop()
    s.options.states.push(s.period.close - s.options.last_close_price)
    s.options.last_close_price = s.period.close


    function calcProfit(s) {
      //if we didn't make any trades yet just return 0
      if(s.my_trades.length === 0)
      return 0

      var total_currency = parseInt(s.balance.asset)*s.period.close + parseInt(s.balance.currency)
      var start_capital = s.start_capital
      //var profit = total_currency - start_capital
      var profit = total_currency - s.options.previous_profit
      // TODO we can add also change from previous run
      s.options.previous_profit = total_currency
      var binary_profit = profit > 0 ? 1 : 0
      console.log('\nprevious_profit: ', s.options.previous_profit, ', current_profit: ', profit, ', action:', s.action, ' last_signal: ', s.last_signal)

      return binary_profit

      // calculate profit
      /*var profit = s.start_capital ? n(s.balance.currency).subtract(s.start_capital).divide(s.start_capital) : n(0)
      var current_profit = profit.value()
      var profit_slope = current_profit - s.options.previous_profit
      //minor punishment
      if(profit_slope === 0.0)
      profit_slope = -0.01

      console.log('\nprevious_profit: ', s.options.previous_profit, ', current_profit: ', current_profit, ', slope:', profit_slope, ', action:', s.action, ' last_signal: ', s.last_signal)
      return profit_slope
      */
    }


    function savenet(brain) {
      if(brain){
        var filename = 'value_net.json';
        var j = brain.value_net.toJSON();
        var t = JSON.stringify(j)

        fs.writeFile(filename, t, function(err) {
          if(err) {
            return console.log(err);
          }
        });
      }
    }


    // training happens here


    // ***** Reward the last action
    reward = calcProfit(s)
    s.options.brain.backward(reward)

    // ***** Predict next state
    var action = s.options.brain.forward(s.options.states);

    if(action === 0)
    s.signal = null
    else if (action === 1)
    s.signal = 'buy'
    else if (action === 2)
    s.signal = 'sell'

    console.log('\nsetting new action:', s.signal)
    console.log('brain-age:', s.options.brain.age)
    console.log('average Q-learning loss:', s.options.brain.average_loss_window.get_average())
    console.log('smooth-ish reward: ',  s.options.brain.average_reward_window.get_average())
    console.log()


    if(s.options.saved_since_ticker > s.options.save_every_x) {
      //save trained brain to file
      savenet(s.options.brain)
      s.options.saved_since_ticker = 0
    }

    s.options.saved_since_ticker += 1

    cb()
},



onReport: function (s) {
  var cols = []
  if (typeof s.period.macd_histogram === 'number') {
    var color = 'grey'
    if (s.period.macd_histogram > 0) {
      color = 'green'
    }
    else if (s.period.macd_histogram < 0) {
      color = 'red'
    }
    cols.push(z(8, n(s.period.macd_histogram).format('+00.0000'), ' ')[color])
    cols.push(z(8, n(s.period.overbought_rsi).format('00'), ' ').cyan)
  }
  else {
    cols.push('         ')
  }
  return cols
}
}
}
