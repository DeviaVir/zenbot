                         ======= Ehlers MESA Adaptive Moving Average =======

Developed by John Ehlers, the MESA Adaptive Moving Average is a technical trend-following indicator which, 
according to its creator, adapts to price movement “based on the rate change of phase as measured by the 
Hilbert Transform Discriminator”. This method of adaptation features a fast and a slow moving average so 
that the composite moving average swiftly responds to price changes and holds the average value until the 
next bar’s close. Ehlers states that because the average’s fallback is slow, you can create trading systems 
with almost whipsaw-free trades.

Basically the indicator looks like two moving averages, but instead of curving around the price action, 
the MESA Adaptive MA moves in a staircase manner as the price ratchets. It produces two outputs, MAMA and FAMA. 
FAMA (Following Adaptive Moving Average) is a result of MAMA being applied to the first MAMA line. The FAMA 
is synchronized in time with MAMA, but its vertical movement comes with a lag. Thus, the two don’t cross unless 
a major change in market direction occurs, resulting in a moving average crossover system which is “virtually 
free of whipsaw trades”, according to Ehlers.

If you appreciate the work and the man hours that went into creating this strategy, please consider giving back.

LoneWolf345 ETH = 0xa42f6d21f1e52f7fbaeaa0f58d1cc4b9a58f2dcc , BTC = 15L8QstCQG4ho6139hVaqLxkAzcjnqBbf6
Travis      ETH = 0xdA963A127BeCB08227583d11f912F400D5347060 , BTC = 3KKHdBJpEGxghxGazoE4X7ihyr2q6nHUvW










                               ===== Trading View Script =====


//@version=2
strategy("Ehlers MESA Adaptive Moving Average", shorttitle="Ehlers_MAMA", overlay=true, precision=3, initial_capital=1000)

// === INPUTS

src=input(hlc3, title="Source")
fl=input(.5, title="Fast Limit", step=0.5)
sl=input(.05, title="Slow Limit", step=0.05)
pa=input(true, title="Mark crossover points")
fr=input(true, title="Fill MAMA/FAMA Region")
ebc=input(false, title="Enable Bar colors")
// === /INPUTS



// === FUNCTIONS

pi = 3.1415926
sp = (4*src + 3*src[1] + 2*src[2] + src[3]) / 10.0
dt = (.0962*sp + .5769*nz(sp[2]) - .5769*nz(sp[4])- .0962*nz(sp[6]))*(.075*nz(p[1]) + .54)
q1 = (.0962*dt + .5769*nz(dt[2]) - .5769*nz(dt[4])- .0962*nz(dt[6]))*(.075*nz(p[1]) + .54)
i1 = nz(dt[3])
jI = (.0962*i1 + .5769*nz(i1[2]) - .5769*nz(i1[4])- .0962*nz(i1[6]))*(.075*nz(p[1]) + .54)
jq = (.0962*q1 + .5769*nz(q1[2]) - .5769*nz(q1[4])- .0962*nz(q1[6]))*(.075*nz(p[1]) + .54)
i2_ = i1 - jq
q2_ = q1 + jI
i2 = .2*i2_ + .8*nz(i2[1])
q2 = .2*q2_ + .8*nz(q2[1])
re_ = i2*nz(i2[1]) + q2*nz(q2[1])
im_ = i2*nz(q2[1]) - q2*nz(i2[1])
re = .2*re_ + .8*nz(re[1])
im = .2*im_ + .8*nz(im[1])
p1 = iff(im!=0 and re!=0, 360/atan(im/re), nz(p[1]))
p2 = iff(p1 > 1.5*nz(p1[1]), 1.5*nz(p1[1]), iff(p1 < 0.67*nz(p1[1]), 0.67*nz(p1[1]), p1))
p3 = iff(p2<6, 6, iff (p2 > 50, 50, p2))
p = .2*p3 + .8*nz(p3[1])
spp = .33*p + .67*nz(spp[1])
phase = atan(q1 / i1)
dphase_ = nz(phase[1]) - phase
dphase = iff(dphase_< 1, 1, dphase_)
alpha_ = fl / dphase
alpha = iff(alpha_ < sl, sl, iff(alpha_ > fl, fl, alpha_))
mama = alpha*src + (1 - alpha)*nz(mama[1])
fama = .5*alpha*mama + (1 - .5*alpha)*nz(fama[1])

plotarrow(pa?(cross(mama, fama)?mama<fama?-1:1:na):na, title="Crossover Markers")
duml=plot(fr?(mama>fama?mama:fama):na, style=circles, color=gray, linewidth=0, title="DummyL")
mamal=plot(mama, title="MAMA", color=red, linewidth=0)
famal=plot(fama, title="FAMA", color=green, linewidth=0)
fill(duml, mamal, red, transp=50, title="NegativeFill")
fill(duml, famal, green, transp=50, title="PositiveFill")
bc=mama>fama?lime:red

// === Upgraded Conditions Framework ===

////////////////////////////////////////////////////////////////////////////

long_entry = cross(mama, fama)?mama>fama?true:false:false

short_entry = cross(mama, fama)?mama<fama?true:false:false

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