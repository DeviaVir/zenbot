## The Zentalk concept

**Zentalk** is a small set of programs that makes it easy to monitor and make use data from Zenbot without interupting its operation.
Most notably this is the start options, trades, periods and a lot more. The most important parts are the **talker** program 
that enables *websockets* (*WS*) on **Zenbot** and two client programs to make use of the data from **Zenbot**. 
The two programs are **zentalk** and **zenout**. The first one is a fullblown *websocket* CLI program to inspect the data from **Zenbot**. 
The other one is a lightweight *websocket* streaming client which can *subscribe* to data objects from **Zenbot** for use in other programs.
With **zenout** as an example one can do some simple node programming to use the output as anything thinkable.
Here are some examples:

 - a *messaging bot* which can send trading events
 - write data that later can be used for statistics or graphing
 - producing data for a web front end
 - and a lot of other stuff

### talker

The **talker** program is a leightweight *wesocket* server loosely connected to **Zenbot**. 
Some small modifications are necessary to the **lib/engine.js** program to get useful data from the system.
The modifications are kept small to get a slim footprint into the program. Some small modifications are also done in
**conf-sample.js** to get defaut TCP ports for the first connected client. Spesification of TCP ports to 
additional clients are done  on the command line when starting another instance of **Zenbot**. 
To achieve this a modification is done on the *commands/trade.js* to pick up the ports for the clients.
A pair of ports are used, one for **zentalk** and one for **zenout**

```--talk_port <port>``` for **zenout** and ```--command_port <port>``` for **zentalk**

If not using the default ports, **Zenbot** should be invoked like this:

```zenbot trade <some options> --talk_port 8080 --command_port 8081 <selector>```

### zentalk

The **zentalk** program connects to a TCP port has a comand line interface with a few simple commands to control its operation. 
It has a help command to show the available commands. The help command gives this output:
```
> help
  Usage: get <object>
    Objects are:
        who
        balance
        product
        period
        strat
        quote
        status
        trades
```
The data is delevered as beautified *JSON* data. Here are a some examples:
```
> get options
  {
    "paper": true,
    "reset_profit": true,
    "talk_port": 8082,
    "command_port": 8083,
    "strategy": "trend_ema",
    "sell_stop_pct": 0,
    "buy_stop_pct": 0,
    "profit_stop_enable_pct": 0,
    "profit_stop_pct": 1,
    "max_slippage_pct": 5,
    "buy_pct": 99,
    "sell_pct": 99,
    "order_adjust_time": 30000,
    "max_sell_loss_pct": 25,
    "order_poll_time": 5000,
    "markup_pct": 0,
    "order_type": "maker",
    "poll_trades": 30000,
    "currency_capital": 1000,
    "asset_capital": 0,
    "rsi_periods": 14,
    "avg_slippage_pct": 0.045,
    "stats": true,
    "mode": "paper",
    "selector": "bitfinex.XRP-USD",
    "period": "2m",
    "min_periods": 52,
    "trend_ema": 26,
    "neutral_rate": "auto",
    "oversold_rsi_periods": 14,
    "oversold_rsi": 10
}
> get period
  {
    "period_id": "2m12490313",                                           
    "size": "2m",                                                        
    "time": 1498837560000,                                               
    "open": 0.255,                                                       
    "high": 0.25502,                                                     
    "low": 0.255,                                                        
    "close": 0.25502,                                                    
    "volume": 3160.1400000000003,                                        
    "close_time": 1498837618000,                                         
    "trend_ema": 0.25246624412245805,                                    
    "oversold_rsi_avg_gain": 0.00038205180780631186,                     
    "oversold_rsi_avg_loss": 0.00018113157638666248,                     
    "oversold_rsi": 68,                                                  
    "trend_ema_rate": 0.08098743204999516,                               
    "trend_ema_stddev": 0.016211589445806786,                            
    "id": "ff7f935e",                                                    
    "selector": "bitfinex.XRP-USD",                                      
    "session_id": "51b6adf3",                                            
    "rsi_avg_gain": 0.00038205180780631186,                              
    "rsi_avg_loss": 0.00018113157638666248,                              
    "rsi": 68                                                            
}                                                                        
> get balance
  {
    "asset": "3901.42011835",                                            
    "currency": "11.11735266"                                            
}                                                                        
> get trades
  [
    {
        "time": 1498836575000,
        "execution_time": 61000,
        "slippage": 0.0004499802449624344,
        "type": "buy",
        "size": "3911.49743185",
        "fee": 3.90532544379,
        "price": "0.25321389",
        "order_type": "maker",
        "id": "74db29b9",
        "selector": "bitfinex.XRP-USD",
        "session_id": "51b6adf3",
        "mode": "paper"
    }
]
>
```

### zenout

Basicly the **zenout** program delivers the same data as the **zentalk** program. 
The difference is the invocation and the form of the output which is *raw JSON*. 
It is invoke from the command line with host: port as parameters.
```
$ ./zentalk -c localhost:8083
```
However, to get something useful from the progran you need to subscribe to data
```
$ ./zentalk -c localhost:8083 --sub lastTrade
```
With this option you will get the last trade from *Zenbot*. 
It is possible to stop the client and start it again withot losing the subscription, meaning you can start it without a new subscription. 
If you want to get another set of data, it is wise to unsubscribe the previous subscription. This can be done in one operation.
```
./zentalk -c localhost:8083 --unsub lastTrade --sub period
```

