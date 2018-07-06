                                    ======= Ichimoku Signals Score =======


The Ichimoku signals, indeed all Ichimoku elements, should never be taken in isolation, but considered in the context
of the overall chart.  Ichimoku Kinko Hyo is a visual technical analysis system and the charts are designed to be
considered in their entirety, with regard given to the relationships between all of the elements, including the price.
As such, Ichimoku is not suitable for automated or "single event" decision making.

Remember that Ichimoku Kinko Hyo is a technical trend trading charting system and trends can and do change, so your
readings of the charts should be probabilistic, rather than predictive.  As with most technical analysis methods,
Ichimoku is likely to produce frequent conflicting signals in non-trending markets.

The five kinds of signal are described below.  Most can be classified as strong, neutral, or weak by their proximate
relationship to the Kumo (cloud), but each signal may be further strengthened, weakened, or nullified by the
relationships between other elements.  All signals must be considered in respect to the overall chart.

For a better understanding of how to read ichimoku please refer to http://www.ichimokutrader.com/signals.html
Code based on a TradingView.com script at https://www.tradingview.com/v/u0NN8zNu/

If you appreciate the work and the man hours that went into creating this strategy, please consider giving back.
LoneWolf345 ETH = 0xa42f6d21f1e52f7fbaeaa0f58d1cc4b9a58f2dcc , BTC = 15L8QstCQG4ho6139hVaqLxkAzcjnqBbf6
Travis      ETH = 0xdA963A127BeCB08227583d11f912F400D5347060 , BTC = 3KKHdBJpEGxghxGazoE4X7ihyr2q6nHUvW










                                    ======= Trading View Strategy Script =======


//@version=2
//study(title="Ichimoku Cloud Score LW", shorttitle="Ichimoku Score", precision=3, overlay=false)
strategy(title="Ichimoku Cloud Signal Score", shorttitle="Ichimoku Score", precision=3, overlay=false)

// == ichimoku inputs ==
tenkenSenPeriods = input(9, minval=1, title="Tenkan-sen (Conversion Line) Periods"),
kijunSenPeriods = input(26, minval=1, title="Kijun-sen (Base Line) Periods")
senkouSpanPeriods = input(52, minval=1, title="Senkou (Leading) Span B Periods"),
displacement = input(26, minval=1, title="Displacement")


// == score inputs ==
tkCrossWeight = input(1.0, title="TK Cross Importance Weight", type=float, step=0.1)
pkCrossWeight = input(1.0, title="PK Cross Importance Weight", type=float, step=0.1)
kumoBreakoutWeight = input(1.0, title="Kumo Breakout Importance Weight", type=float, step=0.1)
senkouCrossWeight = input(1.0, title="Senkou (Leading) Span Cross Importance Weight", type=float, step=0.1)
chikouCrossWeight = input(1.0, title="Chikou (Lagging) Span Cross Importance Weight", type=float, step=0.1)
chikouPlacementWeight = input(1.0, title="Chikou (Lagging) Span Relative to Cloud Importance Weight", type=float, step=0.1)
pricePlacementWeight = input(1.0, title="Price Relative to Cloud Importance Weight", type=float, step=0.1)

weakPoints = input(0.5, title="Weak Point Value", type=float, step=0.1)
neutralPoints = input(1.0, title="Neutral Point Value", type=float, step=0.1)
strongPoints = input(2.0, title="Strong Point Value", type=float, step=0.1)


// == helpers ==
donchian(len) => avg(lowest(len), highest(len))
resolve(src, default) => na(src) ? default : src
getIntersect(series1, series2) => (series1[1] * (series2 - series2[1]) - series2[1] * (series1 - series1[1])) / ((series2 - series2[1]) - (series1 - series1[1]))
belowKumo(val, senkou1, senkou2) => val < senkou1[1] and val < senkou2[1] and val < senkou1 and val < senkou2
aboveKumo(val, senkou1, senkou2) => val > senkou1[1] and val > senkou2[1] and val > senkou1 and val > senkou2
insideKumo(val, senkou1, senkou2) => (not belowKumo(val, senkou1, senkou2)) and (not aboveKumo(val, senkou1, senkou2))


// == generate ichimoku data ==
tenkanSen = donchian(tenkenSenPeriods)
kijunSen = donchian(kijunSenPeriods)
chikouSen = offset(close, -displacement)

senkouA = offset(avg(tenkanSen, kijunSen), displacement)
senkouB = offset(donchian(senkouSpanPeriods), displacement)

priceAboveKumo = aboveKumo(close, senkouA, senkouB)
priceBelowKumo = belowKumo(close, senkouA, senkouB)
priceInsideKumo = insideKumo(close, senkouA, senkouB)


// == ichimoku cloud signals ==
// source: http://www.ichimokutrader.com/signals.html

// == Tenkan Sen (turning line) / Kijun Sen (standard line) Cross ==
calcTkCross(previousVal) =>
    bullish = crossover(tenkanSen, kijunSen)
    bearish = crossunder(tenkanSen, kijunSen)

    intersect = getIntersect(tenkanSen, kijunSen)
    above = aboveKumo(intersect, senkouA, senkouB)
    below = belowKumo(intersect, senkouA, senkouB)
    inside = insideKumo(intersect, senkouA, senkouB)

    score = resolve(previousVal, 0)
    score := (bullish and below) ? weakPoints : score
    score := (bullish and inside) ? neutralPoints : score
    score := (bullish and above) ? strongPoints : score
    score := (bearish and below) ? -strongPoints : score
    score := (bearish and inside) ? -neutralPoints : score
    score := (bearish and above) ? -weakPoints : score
    score

// == Price and Kijun Sen (standard line) Cross ==
calcPkCross(previousVal) =>
    bullish = crossover(close, kijunSen)
    bearish = crossunder(close, kijunSen)
    
    intersect = getIntersect(close, kijunSen)
    above = aboveKumo(intersect, senkouA, senkouB)
    below = belowKumo(intersect, senkouA, senkouB)
    inside = insideKumo(intersect, senkouA, senkouB)

    score = resolve(previousVal, 0)
    score := (bullish and below) ? weakPoints : score
    score := (bullish and inside) ? neutralPoints : score
    score := (bullish and above) ? strongPoints : score
    score := (bearish and below) ? -strongPoints : score
    score := (bearish and inside) ? -neutralPoints : score
    score := (bearish and above) ? -weakPoints : score
    score

// == Kumo Breakouts ==
calcKumoBreakout(previousVal) =>
    bullish = (crossover(close, senkouA) and senkouA >= senkouB) or (crossover(close, senkouB) and senkouB >= senkouA)
    bearish = (crossunder(close, senkouB) and senkouA >= senkouB) or (crossunder(close, senkouA) and senkouB >= senkouA)

    score = resolve(previousVal, 0)
    score := bullish ? strongPoints : score
    score := bearish ? -strongPoints : score
    score

// == Senkou Span Cross ==
// The Senkou Span Cross signal occurs when the Senkou Span A (1st leading line) crosses the Senkou Span B (2nd leading line).
// NOTE: this cross occurs ahead of the price, since it's displaced to the right; this displacement must be removed
calcSenkouCross(previousVal) =>
    noDpsenkouA = avg(tenkanSen, kijunSen) // Senkou Span A (no displacement)
    noDpsenkouB = donchian(senkouSpanPeriods) // Senkou Span B (no displacement)

    bullish = crossover(noDpsenkouA, noDpsenkouB)
    bearish = crossunder(noDpsenkouA, noDpsenkouB)

    score = resolve(previousVal, 0)
    score := (bullish and priceBelowKumo) ? weakPoints : score
    score := (bullish and priceInsideKumo) ? neutralPoints : score
    score := (bullish and priceAboveKumo) ? strongPoints : score
    score := (bearish and priceBelowKumo) ? -strongPoints : score
    score := (bearish and priceInsideKumo) ? -neutralPoints : score
    score := (bearish and priceAboveKumo) ? -weakPoints : score
    score

// == Chikou Span Cross ==
// The Chikou Span Cross signal occurs when the Chikou Span (Lagging line) rises above or falls below the price.
calcChikouCross(previousVal) =>
    // think in terms of current price = chikouSen
    leadLine = offset(close, displacement)
    bullish = crossover(close, leadLine)
    bearish = crossunder(close, leadLine)
    
    score = resolve(previousVal, 0)
    score := (bullish and priceBelowKumo) ? weakPoints : score
    score := (bullish and priceInsideKumo) ? neutralPoints : score
    score := (bullish and priceAboveKumo) ? strongPoints : score
    score := (bearish and priceBelowKumo) ? -strongPoints : score
    score := (bearish and priceInsideKumo) ? -neutralPoints : score
    score := (bearish and priceAboveKumo) ? -weakPoints : score
    score

// == price relative to cloud ==
calcPricePlacement(previousVal) => 
    score = resolve(previousVal, 0)
    score := priceAboveKumo ? strongPoints : score
    score := priceInsideKumo ? 0 : score
    score := priceBelowKumo ? -strongPoints : score
    score
    
// == lag line releative to cloud ==
calcChikouPlacement(previousVal) => 
    // doing calculation based on left-shifted chikouSen caused errors.  
    // Instead we shift the kumo right again and do comparison based on current price
    shiftedSenkouA = offset(senkouA, displacement)
    shiftedSenkouB = offset(senkouB, displacement)
    score = resolve(previousVal, 0)
    score := aboveKumo(close, shiftedSenkouA, shiftedSenkouB) ? strongPoints : score
    score := insideKumo(close, shiftedSenkouA, shiftedSenkouB) ? 0 : score
    score := belowKumo(close, shiftedSenkouA, shiftedSenkouB) ? -strongPoints : score
    score


// == plot score ==
tkCrossScore = calcTkCross(tkCrossScore[1])
pkCrossScore = calcPkCross(pkCrossScore[1])
kumoBreakoutScore = calcKumoBreakout(kumoBreakoutScore[1])
senkouCrossScore = calcSenkouCross(senkouCrossScore[1])
chikouCrossScore = calcChikouCross(chikouCrossScore[1])
pricePlacementScore = calcPricePlacement(pricePlacementScore[1])
chikouPlacementScore = calcChikouPlacement(chikouPlacementScore[1])


totalScore = (tkCrossWeight * tkCrossScore)
totalScore := totalScore + (pkCrossWeight * pkCrossScore) 
totalScore := totalScore + (kumoBreakoutWeight * kumoBreakoutScore)
totalScore := totalScore + (senkouCrossWeight * senkouCrossScore)
totalScore := totalScore + (chikouCrossWeight * chikouCrossScore)
totalScore := totalScore + (pricePlacementWeight * pricePlacementScore)
totalScore := totalScore + (chikouPlacementWeight * chikouPlacementScore)

maxScore = strongPoints * (tkCrossWeight + pkCrossWeight + kumoBreakoutWeight + senkouCrossWeight + chikouCrossWeight + pricePlacementWeight + chikouPlacementWeight)
normalizedScore = 100 * totalScore / maxScore

base = hline(50, color=gray, linestyle=solid, linewidth=2, title="Base")
max = hline(100, color=gray, linestyle=solid, title="Max")
min = hline(-100, color=gray, linestyle=solid, title="Min")
fill(max, base, color=green, title="Bullish")
fill(min, base, color=red, title="Bearish")
plot(normalizedScore, color=orange, linewidth=3, title="Total Score")


// // == plot ichimoku ==

// // Tenkan Sen (turning line) (blue)
//plot(tenkanSen, color=blue, title="Tenkan Sen (Turning/Conversion Line)", linewidth=3)

// // Kijun Sen (base/standard line) (red)
//plot(kijunSen, color=red, title="Kijun Sen (Standard/Base Line)", linewidth=3)

// // Chikou Span (lagging line) (green)
//plot(close, offset = -displacement, color=green, title="Chikou Span (Lagging Span)", linewidth=3)

// // Senkou Span A
//renderSenkouA = avg(tenkanSen, kijunSen) // used only for rendering below
//p1 = plot(renderSenkouA, offset = displacement, color=green, title="Senkou Span (Leading Span) A")

// // Senkou Span B
//renderSenkouB = donchian(senkouSpanPeriods) // used only for rendering below
//p2 = plot(renderSenkouB, offset = displacement, color=red, title="Senkou Span (Leading Span) B")

// // i.e. Kumo cloud colouring
//fill(p1, p2, color = renderSenkouA > renderSenkouB ? green : red)


// // == strategy moves == 
//simulateBuys = input(true, title="Simulate Buys")
buyThreshold = input(80.0, title="Buy Threshold", type=float, step=0.1)
sellThreshold = input(50.0, title="Sell Threshold", type=float, step=0.1)


buyCondition = normalizedScore > buyThreshold
sellCondition = normalizedScore < sellThreshold
//strategy.entry("buy", true, 1, when = buyCondition)
//strategy.close("buy", when = sellCondition)




// === Upgraded Conditions Framework ===

////////////////////////////////////////////////////////////////////////////

long_entry = buyCondition == true

short_entry = sellCondition == true

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
isSLs = input(false, "Stop Loss (Short)")
sls = input(6, "Stop Loss %", type=float, step=0.2, minval=0, maxval=100) / 100
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
isTSs = input(false, "Trailing Stop Short")
tsis = input(25, "Activate Trailing Stop % Short", type=float, step=1, minval=0, maxval=100) / 100
tss = input(8, "Trailing Stop % Short", type=float, step=1, minval=0, maxval=100) / 100
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
dir = input(title = "Strategy Direction", defval="Long") //, options=["Long", "Short", "Both"]
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