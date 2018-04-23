                         ======= Ehlers Instantaneous Trend =======



If you appreciate the work and the man hours that went into creating this strategy, please consider giving back.

LoneWolf345 ETH = 0xa42f6d21f1e52f7fbaeaa0f58d1cc4b9a58f2dcc , BTC = 15L8QstCQG4ho6139hVaqLxkAzcjnqBbf6
Travis      ETH = 0xdA963A127BeCB08227583d11f912F400D5347060 , BTC = 3KKHdBJpEGxghxGazoE4X7ihyr2q6nHUvW










                               ===== Trading View Script =====


//@version=2
strategy(title="Ehlers Instantaneous Trend", shorttitle="Ehlers IT", overlay=true, precision=3, initial_capital=1000)

// === INPUTS

src=input(hl2, title="Source")
a= input(0.07, title="Alpha", step=0.01) 
fr=input(true, title="Fill Trend Region")
ebc=input(false, title="Enable barcolors")
hr=input(false, title="Hide Ribbon")
pa=input(true, title="Arrow Markers")
// === /INPUTS



// === FUNCTIONS

it=(a-((a*a)/4.0))*src+0.5*a*a*src[1]-(a-0.75*a*a)*src[2]+2*(1-a )*nz(it[1], ((src+2*src[1]+src[2])/4.0))-(1-a )*(1-a )*nz(it[2], ((src+2*src[1]+src[2])/4.0))
lag=2.0*it-nz(it[2])
dl=plot(fr and (not hr)?(it>lag?lag:it):na, color=gray, style=circles, linewidth=0, title="Dummy")
itl=plot(hr?na:it, color=fr?gray:red, linewidth=1, title="Trend")
ll=plot(hr?na:lag, color=fr?gray:blue, linewidth=1, title="Trigger")
plotarrow(pa?(cross(it, lag)?lag<it?-1:1:na):na, title="Crossover Markers")
fill(dl, ll, green, title="UpTrend", transp=70)
fill(dl, itl, red, title="DownTrend", transp=70)
bc=not ebc?na:(it>lag?red:lime)
barcolor(bc)


// === Upgraded Conditions Framework ===

////////////////////////////////////////////////////////////////////////////

long_entry = cross(it, lag)?lag>it?true:false:false

short_entry = cross(it, lag)?lag<it?true:false:false

long_exit = short_entry    //Close Long Condition Here (Optional)

short_exit = long_entry   //Close Short Condition Here (Optional)

///////////////////////////////////////////////////////////////////////////

// init these values here, they will get updated later as more decisions are made
last_long_close = na
last_short_close = na

// === Long position detection ===
// longs open
longo = 0
longo := nz(longo[1])
// longs closed
longc = 0
longc := nz(longc[1])
if long_entry
    longo := longo + 1
    longc := 0
if long_exit
    longc := longc + 1
    longo := 0
// === /END

// === Short position detection ===
shorto = 0
shorto := nz(shorto[1])
shortc = 0
shortc := nz(shortc[1])
if short_entry
    shorto := shorto + 1
    shortc := 0
if short_exit
    shortc := shortc + 1
    shorto := 0
// === /END

// === Pyramiding Settings ===
pyr = input(1, title="Pyramiding Setting")
//pyr = 1
longCondition = long_entry and longo <= pyr
longX = long_exit and longc <= pyr
shortCondition = short_entry and shorto <=pyr
shortX = short_exit and shortc <=pyr
// === /END

// === Get Last Position Price ===
last_open_longCondition = na
last_open_shortCondition = na
// last open prices
last_open_longCondition := longCondition ? close : nz(last_open_longCondition[1])
last_open_shortCondition := shortCondition ? close : nz(last_open_shortCondition[1])
// === /END

// === Check For Long/Short ===
last_longCondition = na
last_shortCondition = na
// last open times
last_longCondition := longCondition ? time : nz(last_longCondition[1])
last_shortCondition := shortCondition ? time : nz(last_shortCondition[1])
last_longClose = longX ? time : nz(last_long_close[1])
last_shortClose = shortX ? time : nz(last_short_close[1])

in_longCondition = last_longCondition > last_shortCondition and last_longCondition >= last_longClose
in_shortCondition = last_shortCondition > last_longCondition and last_shortCondition >= last_shortClose
// === /END

// === Stop Loss (Long) ===
isSLl = input(false, "Stop Loss (Long)")
sll = input(6, "Stop Loss %", type=float, step=0.2, minval=0, maxval=100) / 100
long_call_sl = last_open_longCondition * (1 - sll)
long_sl = isSLl and low <= long_call_sl and longCondition == 0
// === /END

// === Stop Loss (Short) ===
isSLs = false //input(false, "Stop Loss (Short)")
sls = 6 //input(6, "Stop Loss %", type=float, step=0.2, minval=0, maxval=100) / 100
short_call_sl = last_open_shortCondition * (1 + sls)
short_sl = isSLs and high >= short_call_sl and shortCondition == 0
// === /END

// === Trailing Stop ===
last_high = na
last_low = na
last_high := in_longCondition ? (na(last_high[1]) or high > nz(last_high[1])) ? high : nz(last_high[1]) : na
last_low := in_shortCondition ? (na(last_low[1]) or low < nz(last_low[1])) ? low : nz(last_low[1]) : na
isTSl = input(false, "Trailing Stop Long")
tsil = input(25, "Activate Trailing Stop % Long", type=float, step=1, minval=0, maxval=100) / 100
tsl = input(8, "Trailing Stop % Long", type=float, step=1, minval=0, maxval=100) / 100
long_call_ts = last_high * (1 - tsl)
long_call_tsi = last_open_longCondition * (1 + tsil)
long_ts = isTSl and not na(last_high) and low <= long_call_ts and longCondition == 0 and last_high >= long_call_tsi
isTSs = false //input(false, "Trailing Stop Short")
tsis = 25 //input(25, "Activate Trailing Stop % Short", type=float, step=1, minval=0, maxval=100) / 100
tss = 8 //input(8, "Trailing Stop % Short", type=float, step=1, minval=0, maxval=100) / 100
short_call_ts = last_low * (1 + tss)
short_call_tsi = last_open_shortCondition * (1 - tsis)
short_ts = isTSs and not na(last_low) and high >= short_call_ts and shortCondition == 0 and last_low <= short_call_tsi
// === /END

// === Create Single Close For All Closing Conditions  ===
closelong = long_sl or long_ts or longX
closeshort = short_sl or short_ts or shortX

// Get Last Close
last_long_close := closelong ? time : nz(last_long_close[1])
last_short_close := closeshort ? time : nz(last_short_close[1])

// Check For Close Since Last Open
if closelong and last_long_close[1] > last_longCondition
    closelong := false

if closeshort and last_short_close[1] > last_shortCondition
    closeshort := false
// === /END

////////////////////////////////////////////////////////////////////////////

// === Alarm Settings ===
//alertcondition(longCondition==1, title='LONG', message='LONG')
//alertcondition(closelong==1, title='EXIT LONG', message='EXIT LONG')
//alertcondition(shortCondition==1, title='SHORT', message='SHORT')
//alertcondition(closeshort==1, title='EXIT SHORT', message='EXIT SHORT')
// === /END

////////////////////////////////////////////////////////////////////////////

// === Visuals & Debugs Here ===
//Remove "//" To Check/Debug The Code Above
// Signal Shapes
//plotshape(longCondition[1]==1, title='LONG', style=shape.triangleup, size=size.large, color=#02CB80, location= location.belowbar)
//plotshape(shortCondition[1]==1, title='SHORT', style=shape.triangledown, size=size.large, color=#DC143C, location=location.abovebar)
//plotshape(shortCondition[1]==0 and closelong[1]==1, title='EXIT LONG', style=shape.xcross, color=#02CB80, location=location.belowbar, transp=0)
//plotshape(longCondition[1]==0 and closeshort[1]==1, title='EXIT SHORT', style=shape.xcross, color=#DC143C, location=location.abovebar, transp=0)
// SL Plot
//slColor = (isSLl or isSLs) and (in_longCondition or in_shortCondition) ? red : white
//plot(isSLl and in_longCondition ? long_call_sl : na, "Long SL", slColor, style=3, linewidth=2)
//plot(isSLs and in_shortCondition ? short_call_sl : na, "Short SL", slColor, style=3, linewidth=2)
// TP Plot
//tpColor = isTP and (in_longCondition or in_shortCondition) ? purple : white
//plot(isTP and in_longCondition ? long_call_tp : na, "Long TP", tpColor, style=3, linewidth=2)
//plot(isTP and in_shortCondition ? short_call_tp : na, "Short TP", tpColor, style=3, linewidth=2)
// TS Plot
//tsColor = (isTSl or isTSs) and (in_longCondition or in_shortCondition) ? orange : white
//tsiColor = (isTSl or isTSs) and (in_longCondition or in_shortCondition) ? white : orange
//plot(isTSl and in_longCondition ? long_call_tsi : na, "Long Trailing", tsiColor, style=3, linewidth=2)
//plot(isTSs and in_shortCondition ? short_call_tsi : na, "Short Trailing", tsiColor, style=3, linewidth=2)
//plot(isTSl and in_longCondition and last_high > long_call_tsi ? long_call_ts : na, "Long Trailing", tsColor, style=2, linewidth=2)
//plot(isTSs and in_shortCondition and last_low < short_call_tsi  ? short_call_ts : na, "Short Trailing", tsColor, style=2, linewidth=2)
// === /END

////////////////////////////////////////////////////////////////////////////
//                                                                        //
//             REMOVE THE CODE BELOW FOR STUDY CONVERSION                 //
//                                                                        //
////////////////////////////////////////////////////////////////////////////

// === Strategy Direction Switch ===
dir = "Long" //input(title = "Strategy Direction", defval="Long") //, options=["Long", "Short", "Both"]
// === /END

// === Backtesting Dates ===
testPeriodSwitch = input(false, "Custom Backtesting Dates")
testStartYear = input(2017, "Backtest Start Year")
testStartMonth = input(1, "Backtest Start Month")
testStartDay = input(1, "Backtest Start Day")
testPeriodStart = timestamp(testStartYear,testStartMonth,testStartDay,0,0)
testStopYear = input(9999, "Backtest Stop Year")
testStopMonth = input(1, "Backtest Stop Month")
testStopDay = input(1, "Backtest Stop Day")
testPeriodStop = timestamp(testStopYear,testStopMonth,testStopDay,0,0)
testPeriod() =>
    time >= testPeriodStart and time <= testPeriodStop ? true : false
isPeriod = testPeriodSwitch == true ? testPeriod() : true
// === /END

// === Strategy ===
if isPeriod and dir=="Both"
    if (longCondition)
        strategy.entry("Long",strategy.long)
    if (closelong) and not shortCondition
        strategy.close("Long")
    if (shortCondition)
        strategy.entry("Short",strategy.short)
    if (closeshort) and not longCondition
        strategy.close("Short")

if isPeriod and dir=="Long"
    if (longCondition)
        strategy.entry("Long",strategy.long)
    if (closelong)
        strategy.close("Long")

if isPeriod and dir=="Short"
    if (shortCondition)
        strategy.entry("Short",strategy.short)
    if (closeshort)
        strategy.close("Short")
// === /END

////////////////////////////////////////////////////////////////////////////
//                                                                        //
//                 ULTIMATE PINE INJECTOR V1.2                            //
//                                                                        //
//////////////////////===ANION=CODE=END====/////////////////////////////////