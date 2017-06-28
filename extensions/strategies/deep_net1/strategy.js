var z = require('zero-fill')
, n = require('numbro')
, deepqlearn = require('../../../node_modules/convnetjs/build/deepqlearn.js')
, convnetjs = require('convnetjs')
, fs = require('fs')

module.exports = function container (get, set, clear) {
  return {
    name: 'deep_net1',
    description: 'Deep net 1 (reinforcement learning) ',


    getOptions: function () {
      // build-in
      this.option('period', 'period length in  minutes', String, '2m')
      this.option('period_interval', 'period length in  minutes', Number, 0)
      this.option('brain', 'Brain object container', Object, null)
      this.option('intervals', 'Intervals array', Object, [10, 30, 60, 120, 240])
      this.option('model', 'Path to pre-trained model', String, null)
      this.option('saved_since_ticker', 'Incremental ticker since last save', Number, 0)
      this.option('save_every_x', 'Save every x tick', Number, 1000)
      this.option('save_dataset', 'Saves dateset to data.csv file', Boolean, false)
      this.option('states', 'states', Object, null)


      // Working variables
      this.option('model_initialized', 'initialize var.', Boolean, false)
      this.option('history_ema', 'Ema data from previous run', Object, null)
      this.option('previous_closing_price', 'previous closing price', Number, 0)
      this.option('previous_predicted_state', 'Placeholder for previous predicted state', String, null)




    /*

      this.option('hold', 'Hold', Number, 0)
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

      s.options.history_ema = []
      s.options.period_interval = getPeriodInMinutes(s.options.period)

      function loadnet(brain, file) {
        var dataNet = fs.readFileSync('value_net.json', 'utf8')
        var j = JSON.parse(dataNet);
        s.options.brain.value_net.fromJSON(j);
        brain.learning = false; // stop learning
      }

      // Your initialization goes here
      periodInMinutes = getPeriodInMinutes(s.options.period)

      //initialize q-grid
      var layer_defs = [];
      var num_inputs = 30
      var num_actions = 2     // 3 possible actions (buy, sell, hold)
      var temporal_window = 1 // amount of temporal memory. 0 = agent lives in-the-moment :)
      var network_size = num_inputs*temporal_window + num_actions*temporal_window + num_inputs
      layer_defs.push({type:'input', out_sx:1, out_sy:1, out_depth:network_size});
      layer_defs.push({type:'fc', num_neurons: 50, activation:'relu'});
      layer_defs.push({type:'fc', num_neurons: 50, activation:'relu'});
      layer_defs.push({type:'regression', num_neurons: num_actions});
      var tdtrainer_options = {learning_rate:0.01, momentum:0.0, batch_size:64, l2_decay:0.01};
      var opt = {};
      opt.temporal_window = temporal_window;
      // size of experience replay memory
      opt.experience_size = 30000;
      // number of examples in experience replay memory before we begin learning
      opt.start_learn_threshold = 1000;
      // gamma is a crucial parameter that controls how much plan-ahead the agent does. In [0,1]
      opt.gamma = 0.7;
      //opt.learning_steps_total = 200000;
      // how many steps of the above to perform only random actions (in the beginning)?
      opt.learning_steps_burnin = 3000;
      opt.epsilon_min = 0.05;
      opt.epsilon_test_time = 0.01;
      opt.layer_defs = layer_defs;
      opt.tdtrainer_options = tdtrainer_options;
      s.options.brain = new deepqlearn.Brain(num_inputs, num_actions, opt)

      if(s.options.model){
        loadnet(s.options.brain, s.options.model)
      }

      s.options.model_initialized = true

      //function getPeriodInMinutes(p)
      function getPeriodInMinutes (p) {
        if(p.indexOf('m') !== -1)
        return Number(p.replace('m',''))

        if(p.indexOf('h') !== -1)
        return Number(p.replace('h',''))*60
      }
    },


    /* Called every time when a trade was done
    (for example if in 5min period was done 20 trades, the method will be called 20 times)
    */
    calculate: function (s) {

      if(!s.options.model_initialized)
        this.initialize(s)

      //console.log('in calculate:', s.period.close, ', ', s.period.close_time, ', ', s.lookback.length)
    },

    //-----------------------------------------------------------
    //-----------------------------------------------------------


    onPeriod: function (s, cb) {

      //console.log('on perdio:', s.period.close, ', ', s.period.close_time, ', ', s.lookback.length)
      // Wait until we get all the samples that we need
      var interval = s.options.period_interval
      if(s.lookback.length <= s.options.intervals[s.options.intervals.length-1]/interval){
        cb()
        return
      }



      function storeEmaValues(s){
        // Store previous ema
        s.options.history_ema = []
        var interval = s.options.period_interval
        for(i = 0; i < s.options.intervals.length; i++) {
          var periodName = 'ema' + s.options.intervals[i]
          get('lib.ema')(s, periodName, s.options.intervals[i]/interval)
          s.options.history_ema.push(s.period[periodName])
        }
      }


      function getNewEmaValues(s) {

        // Get ema
        var interval = s.options.period_interval
        for(i = 0; i < s.options.intervals.length; i++) {
          var periodName = 'ema' + s.options.intervals[i]
          get('lib.ema')(s, periodName, s.options.intervals[i]/interval)
        }
      }


      function calcSlopes(s, states) {
        for(i = 0; i < s.options.intervals.length; i++) {
          var periodName = 'ema' + s.options.intervals[i]

          var currentValue = s.period[periodName]
          var previousValue = s.options.history_ema[i]

          var slope_value = currentValue - previousValue
          var slope_binary = slope_value >= 0 ? 1 : 0
          states.push(slope_binary)
        }
      }


      function calcNeighbourEmaStates(s, states) {
        for(i = 0; i < s.options.intervals.length; i++) {
          var iName = 'ema' + s.options.intervals[i]
          for(j = 0; j < s.options.intervals.length; j++) {
            var jName = 'ema' + s.options.intervals[j]
            states.push(s.period[iName] > s.period[jName])
          }
        }
      }


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

        var binary_profit = 0
        if(profit === 0 && s.options.previous_predicted_state === null)
          binary_profit = 1

        if(profit > 0 && s.options.previous_predicted_state === 'buy')
          binary_profit = 1

        if(profit < 0 && s.options.previous_predicted_state === 'sell')
          binary_profit = 1

        //var binary_profit = profit > 0 ? 1 : 0
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


      function convertStatesToInt(states){
        for (i = 0; i < states.length; i++) {
          if(typeof(states[i]) === "boolean")
          states[i] = states[i] ? 1 : 0
        }
      }


      //************************* END OF FUNCTIONS DEFINITION SECTION


      if(s.options.save_dataset === true && s.options.states){
        var line = s.options.states.toString()
        var priceDiff = s.period.close - s.options.previous_closing_price
        var price_slope = 0
        if(priceDiff === 0)
          price_slope = 0
        else
          price_slope = priceDiff > 0 ? 1 : -1

        line += ',' + price_slope + '\n'
        fs.appendFile('data.csv', line)
      }


      // ***** Reward the last action
      reward = calcProfit(s)
      //s.options.agent.learn(reward)
      s.options.brain.backward(reward)
      //s.options.previous_profit = reward
      p = s.period

      // ***** Save current states
      var states = []
      //addPriceStates(s, states)
      getNewEmaValues(s)
      calcSlopes(s, states)
      calcNeighbourEmaStates(s, states)
      convertStatesToInt(states)
      storeEmaValues(s)

      s.options.states = states
      s.options.previous_closing_price = s.period.close

      // ***** Predict next state
      // var action = s.options.agent.act(states)
      var action = s.options.brain.forward(states);
      //console.log('signal:', action)


/*
      if(action === 0)
      s.signal = null
      else if (action === 1)
      s.signal = 'buy'
      else if (action === 2)
      s.signal = 'sell'
*/
      if(action === 0)
      s.signal = 'buy'
      else if (action === 1)
      s.signal = 'sell'

      s.options.previous_predicted_state = s.signal
      console.log('\nsetting new action:', s.signal)
      console.log('brain-age:', s.options.brain.age)
      console.log('average Q-learning loss:', s.options.brain.average_loss_window.get_average())
      console.log('smooth-ish reward: ',  s.options.brain.average_reward_window.get_average())
      console.log()

      if(!s.options.model && s.options.saved_since_ticker > s.options.save_every_x) {
        //save trained brain to file if we are in training mode
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
