var z = require('zero-fill')
  , n = require('numbro')
  , deepqlearn = require('../../../node_modules/convnetjs/build/deepqlearn.js')
  , convnetjs = require('convnetjs')
  , reinforce = require('reinforcenode')
  , fs = require('fs')

module.exports = function container (get, set, clear) {
  return {
    name: 'ql0',
    description: 'Q-learning 0 (reinforcement learning) ',
    initialized: false,

    //function getPeriodInMinutes(p)
    getPeriodInMinutes: function(p)
    {
      if(p.indexOf('m') !== -1)
        return Number(p.replace('m',''))

      if(p.indexOf('h') !== -1)
        return Number(p.replace('h',''))*60
    },


    getOptions: function () {
      // build-in
      this.option('period', 'period length in  minutes', String, '30m')

      //periodInMinutes = this.getPeriodInMinutes(s.options.period)
      //this.option('min_periods', 'min. number of history periods', Number, 10) //43200
      this.option('brain', 'Brain object container', Object, null)
      this.option('agent', 'Agent object container', Object, null)


      // History containers
      this.option('ma10_prev', '', Number, 0)
      this.option('ma30_prev', '', Number, 0)
      this.option('ma60_prev', '', Number, 0)
      this.option('ma90_prev', '', Number, 0)
      this.option('ma150_prev', '', Number, 0)
      this.option('ma360_prev', '', Number, 0)


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
      this.option('saved_since_ticker', 'Incremental ticker since last save', Number, 0)
      this.option('save_every_x', 'Save every x tick', Number, 100)

      //this.option('floor_coef', 'floor coefficient', Number, 0.75)
      //this.option('moon_coef', 'moon coefficient', Number, 1.05)
      //this.option('resistance_coef', 'resistance coefficient', Number, 2.8)

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
      // Your initialization goes here
      periodInMinutes = this.getPeriodInMinutes(s.options.period)

      //initialize q-grid
      var layer_defs = [];

      //q-learning settings
      var num_inputs = 27     //21
      var num_actions = 2     // 3 possible actions (buy, sell, hold)
      var temporal_window = 1 // amount of temporal memory. 0 = agent lives in-the-moment :)
      var network_size = num_inputs*temporal_window + num_actions*temporal_window + num_inputs


      layer_defs.push({type:'input', out_sx:1, out_sy:1, out_depth:network_size});
      layer_defs.push({type:'fc', num_neurons: 50, activation:'relu'});
      layer_defs.push({type:'fc', num_neurons: 50, activation:'relu'});
      layer_defs.push({type:'regression', num_neurons: num_actions});

      // options for the Temporal Difference learner that trains the above net
      // by backpropping the temporal difference learning rule.
      var tdtrainer_options = {learning_rate:0.001, momentum:0.0, batch_size:64, l2_decay:0.01};

      var opt = {};
      opt.temporal_window = temporal_window;
      // size of experience replay memory
      opt.experience_size = 30000;
      // number of examples in experience replay memory before we begin learning
      opt.start_learn_threshold = 1000;
      // gamma is a crucial parameter that controls how much plan-ahead the agent does. In [0,1]
      opt.gamma = 0.7;
      opt.learning_steps_total = 200000;
      // how many steps of the above to perform only random actions (in the beginning)?
      opt.learning_steps_burnin = 3000;
      opt.epsilon_min = 0.05;
      opt.epsilon_test_time = 0.05;
      opt.layer_defs = layer_defs;
      opt.tdtrainer_options = tdtrainer_options;

      //s.brain = new deepqlearn.Brain(num_inputs, num_actions, opt)
      s.options.brain = new deepqlearn.Brain(num_inputs, num_actions, opt)

      /*
      let env = {};
      env.getNumStates = function() { return num_inputs; }
      env.getMaxNumActions = function() { return num_actions }
      let spec = { alpha: 0.01 } // see full options on DQN page
      let Agent = reinforce.DQNAgent
      s.options.agent = new Agent(env, spec)
      */
      this.initialized = true
    },


    /* Called every time when a trade was done
     (for example if in 5min period was done 20 trades, the method will be called 20 times)
    */
    calculate: function (s) {

      if(!this.initialized)
        this.initialize(s)
      //console.log('calculating...', s.period.period_id, '--', s.period.volume)
      // get current ticker data
      //get('lib.ema')(s, 'ma2', 2/periodInMinutes)

      var periodInMinutes = 30
      //get('lib.ema')(s, 'ma10', 10/periodInMinutes)
      get('lib.ema')(s, 'ma30', 30/periodInMinutes)
      get('lib.ema')(s, 'ma60', 60/periodInMinutes)
      get('lib.ema')(s, 'ma90', 90/periodInMinutes)
      get('lib.ema')(s, 'ma150', 150/periodInMinutes)
      get('lib.ema')(s, 'ma360', 360/periodInMinutes) // 6 hours

      //get('lib.sma')(s, 'avg_vol10', 10/periodInMinutes, 'volume')
      get('lib.sma')(s, 'avg_vol30', 30/periodInMinutes, 'volume')
      get('lib.sma')(s, 'avg_vol60', 60/periodInMinutes, 'volume')
      get('lib.sma')(s, 'avg_vol90', 90/periodInMinutes, 'volume')
      get('lib.sma')(s, 'avg_vol150', 150/periodInMinutes, 'volume')
      get('lib.sma')(s, 'avg_vol360', 360/periodInMinutes, 'volume') // 6 hours

    },

    onPeriod: function (s, cb) {

      function addVolumeStates(s, states) {
        p = s.period
        // 2ma states
        //states.push(p.avg_vol2 > p.avg_vol10)
        //states.push(p.avg_vol2 > p.avg_vol30)
        //states.push(p.avg_vol2 > p.avg_vol60)
        //states.push(p.avg_vol2 > p.avg_vol90)
        //states.push(p.avg_vol2 > p.avg_vol150)
        //states.push(p.avg_vol2 > p.avg_vol360)
        // 10avg_vol states
        //states.push(p.avg_vol10 > p.avg_vol30)
        //states.push(p.avg_vol10 > p.avg_vol60)
        //states.push(p.avg_vol10 > p.avg_vol90)
        //states.push(p.avg_vol10 > p.avg_vol150)
        //states.push(p.avg_vol10 > p.avg_vol360)
        // 30avg_vol states
        states.push(p.avg_vol30 > p.avg_vol60)
        states.push(p.avg_vol30 > p.avg_vol90)
        states.push(p.avg_vol30 > p.avg_vol150)
        states.push(p.avg_vol30 > p.avg_vol360)
        // 60avg_vol states
        states.push(p.avg_vol60 > p.avg_vol90)
        states.push(p.avg_vol60 > p.avg_vol150)
        states.push(p.avg_vol60 > p.avg_vol360)
        // 90avg_vol states
        states.push(p.avg_vol90 > p.avg_vol150)
        states.push(p.avg_vol90 > p.avg_vol360)
        // 150avg_vol states
        states.push(p.avg_vol150 > p.avg_vol360)
      }


      function addPriceStates(s, states) {
        p = s.period
        // 2ma states
        //states.push(p.ma2 > p.ma10)
        //states.push(p.ma2 > p.ma30)
        //states.push(p.ma2 > p.ma60)
        //states.push(p.ma2 > p.ma90)
        //states.push(p.ma2 > p.ma150)
        //states.push(p.ma2 > p.ma360)
        // 10ma states
        //states.push(p.ma10 > p.ma30)
        //states.push(p.ma10 > p.ma60)
        //states.push(p.ma10 > p.ma90)
        //states.push(p.ma10 > p.ma150)
        //states.push(p.ma10 > p.ma360)
        // 30ma states
        states.push(p.ma30 > p.ma60)
        states.push(p.ma30 > p.ma90)
        states.push(p.ma30 > p.ma150)
        states.push(p.ma30 > p.ma360)
        // 60ma states
        states.push(p.ma60 > p.ma90)
        states.push(p.ma60 > p.ma150)
        states.push(p.ma60 > p.ma360)
        // 90ma states
        states.push(p.ma90 > p.ma150)
        states.push(p.ma90 > p.ma360)
        // 150ma states
        states.push(p.ma150 > p.ma360)
      }


      function addHistoryStates(s, states){
        p = s.period
        o = s.options

        //states.push(p.ma10 > o.ma10_prev)
        states.push(p.ma30 > o.ma30_prev)
        states.push(p.ma60 > o.ma60_prev)
        states.push(p.ma90 > o.ma90_prev)
        states.push(p.ma150 > o.ma150_prev)
        states.push(p.ma360 > o.ma360_prev)

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

        console.log('\nprevious_profit: ', s.options.previous_profit, ', current_profit: ', profit, ', action:', s.action, ' last_signal: ', s.last_signal)

        var binary_profit = profit > 0 ? 1 : 0
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


      function loadnet(brain) {
        fs.readFile('value_net.json', 'utf8', function (err,data) {
          if (err) {
            return console.log(err);
          }
          //console.log(data);
          var j = JSON.parse(t);
          brain.value_net.fromJSON(j);
          //stoplearn(); // also stop learning
          //gonormal();
        });
      }

      function addCustomStates(s, states){
        /*var currentState = 0
        if(!s.action)
          currentState = 0
        else if (s.action === 'bought')
          currentState = 1
        else if (s.action === 'sold')
          currentState = 2

        states.push(currentState)
        */
        states.push(s.in_preroll)
      }


      function convertStatesToInt(states){
        for (i = 0; i < states.length; i++) {
          if(typeof(states[i]) === "boolean")
            states[i] = states[i] ? 1 : 0
        }
      }


      function savePeriodValues(s){
        //s.options.ma10_prev = s.period.ma10
        s.options.ma30_prev = s.period.ma30
        s.options.ma60_prev = s.period.ma60
        s.options.ma90_prev = s.period.ma90
        s.options.ma150_prev = s.period.ma150
        s.options.ma360_prev = s.period.ma360

      }



      //************************* END OF FUNCTIONS DEFINITION SECTION


      if(!s.options.brain || !s.period.ma360){
        cb()
        return
      }

      if (s.options.last_action === null || s.action === 'bought' || s.action === 'sold' || s.options.ticker > s.options.ticker_timeout_limit)
        s.options.order_finished = true


      // training happens here
      if(s.options.order_finished){

        // ***** Reward the last action
        reward = calcProfit(s)
        //s.options.agent.learn(reward)
        s.options.brain.backward(reward)
        //s.options.previous_profit = reward
        p = s.period

        // ***** Save current states
        var states = []
        addPriceStates(s, states)
        addVolumeStates(s, states)
        addCustomStates(s, states)
        addHistoryStates(s, states)
        convertStatesToInt(states)

        savePeriodValues(s)

        // ***** Predict next state
        //ar action = s.options.agent.act(states)
        var action = s.options.brain.forward(states);
        //console.log('signal:', action)

        if(action === 0)
          //s.signal = null
        //else if (action === 1)
          s.signal = 'buy'
        else if (action === 1)
          s.signal = 'sell'

        console.log('\nsetting new action:', s.signal)

        if(s.options.last_action != s.signal)
          s.options.order_finished = false

        s.options.last_action = s.signal
        s.options.ticker = 0


        console.log('brain-age:', s.options.brain.age)
        console.log('average Q-learning loss:', s.options.brain.average_loss_window.get_average())
        console.log('smooth-ish reward: ',  s.options.brain.average_reward_window.get_average())
        console.log()
      }

      s.options.ticker += 1


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
