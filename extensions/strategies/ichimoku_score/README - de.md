                                    ======= Ichimoku Signals Score =======


Die Ichimoku-Signale, in der Tat alle Ichimoku-Elemente, sollten niemals isoliert betrachtet, sondern im Kontext des Gesamtdiagramms betrachtet werden . 
Ichimoku Kinko Hyo ist ein visuelles technisches Analysesystem und die Diagramme sind in ihrer Gesamtheit so konzipiert betrachtet, in Bezug auf die Beziehungen zwischen allen Elementen, einschließlich des Preises.
Daher ist Ichimoku nicht für automatisierte oder "Einzelereignis" -Entscheidungen geeignet.

Denken Sie daran, dass Ichimoku Kinko Hyo ein technisches Trend-Trading-Charting-System ist und Trends sich ändern können und müssen. 
Die Messwerte der Diagramme sollten eher probabilistisch als prädiktiv sein. 
Wie bei den meisten technischen Analysemethoden Ichimoku wird in nicht trendigen Märkten wahrscheinlich häufig widersprüchliche Signale erzeugen. 

Die fünf Arten von Signalen werden unten beschrieben. 
Die meisten können von ihrem Nachbarn als stark, neutral oder schwach eingestuft werden. 
Beziehung zum Kumo (Wolke), aber jedes Signal kann durch das weiter verstärkt, geschwächt oder aufgehoben werden. 
Beziehungen zwischen anderen Elementen. Alle Signale müssen in Bezug auf das Gesamtdiagramm berücksichtigt werden.

Weitere Informationen zum Lesen von Ichimoku finden Sie unter http://www.ichimokutrader.com/signals.html
Code basierend auf einem TradingView.com-Skript unter https://www.tradingview.com/v/u0NN8zNu/

Wenn Sie die Arbeit und die Arbeitsstunden schätzen, die für die Erstellung dieser Strategie aufgewendet wurden, sollten Sie eine Rückgabe in Betracht ziehen.
LoneWolf345 ETH = 0xa42f6d21f1e52f7fbaeaa0f58d1cc4b9a58f2dcc , BTC = 15L8QstCQG4ho6139hVaqLxkAzcjnqBbf6
Travis      ETH = 0xdA963A127BeCB08227583d11f912F400D5347060 , BTC = 3KKHdBJpEGxghxGazoE4X7ihyr2q6nHUvW










                                    ======= Trading View Strategy Script =======


//@version=2
//study(title="Ichimoku Cloud Score LW", shorttitle="Ichimoku Score", precision=3, overlay=false)
strategy(title="Ichimoku Cloud Signal Score", shorttitle="Ichimoku Score", precision=3, overlay=false)

// == ichimoku Eingaben ==
tenkenSenPeriods = input(9, minval=1, title="Tenkan-sen (Conversion Line) Periods"),
kijunSenPeriods = input(26, minval=1, title="Kijun-sen (Base Line) Periods")
senkouSpanPeriods = input(52, minval=1, title="Senkou (Leading) Span B Periods"),
displacement = input(26, minval=1, title="Displacement")


// == Score-Eingaben ==
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


// == Helfer ==
donchian(len) => avg(lowest(len), highest(len))
resolve(src, default) => na(src) ? default : src
getIntersect(series1, series2) => (series1[1] * (series2 - series2[1]) - series2[1] * (series1 - series1[1])) / ((series2 - series2[1]) - (series1 - series1[1]))
belowKumo(val, senkou1, senkou2) => val < senkou1[1] and val < senkou2[1] and val < senkou1 and val < senkou2
aboveKumo(val, senkou1, senkou2) => val > senkou1[1] and val > senkou2[1] and val > senkou1 and val > senkou2
insideKumo(val, senkou1, senkou2) => (not belowKumo(val, senkou1, senkou2)) and (not aboveKumo(val, senkou1, senkou2))


// == ichimoku-Daten generieren. ==
tenkanSen = donchian(tenkenSenPeriods)
kijunSen = donchian(kijunSenPeriods)
chikouSen = offset(close, -displacement)

senkouA = offset(avg(tenkanSen, kijunSen), displacement)
senkouB = offset(donchian(senkouSpanPeriods), displacement)

priceAboveKumo = aboveKumo(close, senkouA, senkouB)
priceBelowKumo = belowKumo(close, senkouA, senkouB)
priceInsideKumo = insideKumo(close, senkouA, senkouB)


// == ichimoku Wolkensignale. ==
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

// == Preis und Kijun Sen (Standardlinie) Kreuz ==
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
// Das Senkou Span Cross-Signal tritt auf, wenn die Senkou Span A (1. führende Linie) die Senkou Span B (2. führende Linie) kreuzt.
// HINWEIS: Dieses Kreuz tritt vor dem Preis auf, da es nach rechts verschoben ist. Diese Verschiebung muss entfernt werden. 
calcSenkouCross(previousVal) =>
    noDpsenkouA = avg(tenkanSen, kijunSen) // Senkou Span A (keine Verschiebung)
    noDpsenkouB = donchian(senkouSpanPeriods) // Senkou Span B (keine Verschiebung)

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
// Das Chikou Span Cross-Signal tritt auf, wenn die Chikou Span (Nachlauflinie) über oder unter den Preis steigt.
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

// == Preis relativ zur Cloud. ==
calcPricePlacement(previousVal) => 
    score = resolve(previousVal, 0)
    score := priceAboveKumo ? strongPoints : score
    score := priceInsideKumo ? 0 : score
    score := priceBelowKumo ? -strongPoints : score
    score
    
// == Verzögerungslinie relativ zur Cloud. ==
calcChikouPlacement(previousVal) => 
    // Berechnungen basierend auf links verschobenem ChikouSen haben Fehler verursacht. 
    // Stattdessen verschieben wir den Kumo wieder nach rechts und führen einen Vergleich basierend auf dem aktuellen Preis durch. 
    shiftedSenkouA = offset(senkouA, displacement)
    shiftedSenkouB = offset(senkouB, displacement)
    score = resolve(previousVal, 0)
    score := aboveKumo(close, shiftedSenkouA, shiftedSenkouB) ? strongPoints : score
    score := insideKumo(close, shiftedSenkouA, shiftedSenkouB) ? 0 : score
    score := belowKumo(close, shiftedSenkouA, shiftedSenkouB) ? -strongPoints : score
    score


// == Plot Score ==
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


// // == Plot ichimoku ==

// // Tenkan Sen (turning line) (blue) (Wendelinie) (blau)
//plot(tenkanSen, color=blue, title="Tenkan Sen (Dreh-/Umwandlungslinie)", linewidth=3)

// // Kijun Sen (base/standard line) (red) (Basis-/Standardlinie) (rot)
//plot(kijunSen, color=red, title="Kijun Sen (Standard/Basislinie)", linewidth=3)

// // Chikou Span (lagging line) (green) (nachlaufende Linie) (grün)
//plot(close, offset = -displacement, color=green, title="Chikou Span (nachlaufende Linie)", linewidth=3)

// // Senkou Span A
//renderSenkouA = avg(tenkanSen, kijunSen) // wird nur zum Rendern unten verwendet
//p1 = plot(renderSenkouA, offset = displacement, color=green, title="Senkou Span A (führende maßgebende grüne Linie A)")

// // Senkou Span B
//renderSenkouB = donchian(senkouSpanPeriods) // wird nur zum Rendern unten verwendet
//p2 = plot(renderSenkouB, offset = displacement, color=red, title="Senkou Span B (führende maßgebende rote Linie B)")

// // d. h. Kumo Cloudfärbung
//fill(p1, p2, color = renderSenkouA > renderSenkouB ? green : red)


// // == Strategischebewegung == 
//simulateBuys = input(true, title="Simulierte Käufe")
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

long_exit = short_entry    // Lange Bedingung wird geschlossen. (optional)

short_exit = long_entry   // Kurze Bedingung wird geschlossen. (optional)

///////////////////////////////////////////////////////////////////////////

// Initiiere diese Werte hier, sie werden später aktualisiert, wenn weitere Entscheidungen getroffen werden. 
last_long_close = na
last_short_close = na

// === Long Positionserkennung ===
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

// === Short Positionserkennung ===
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

// === Pyramiden Einstellungen ===
pyr = input(1, title="Pyramiding Setting")
//pyr = 1
longCondition = long_entry and longo <= pyr
longX = long_exit and longc <= pyr
shortCondition = short_entry and shorto <=pyr
shortX = short_exit and shortc <=pyr
// === /END

// === Holt für die letzte Position den Preis. ===
last_open_longCondition = na
last_open_shortCondition = na
// last open prices
last_open_longCondition := longCondition ? close : nz(last_open_longCondition[1])
last_open_shortCondition := shortCondition ? close : nz(last_open_shortCondition[1])
// === /END

// ===  Auf Long/Short prüfen ===
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

// === Stop Loss (Long) Stoppen und verlieren. ===
isSLl = input(false, "Stop Loss (Long)")
sll = input(6, "Stop Loss %", type=float, step=0.2, minval=0, maxval=100) / 100
long_call_sl = last_open_longCondition * (1 - sll)
long_sl = isSLl and low <= long_call_sl and longCondition == 0
// === /END

// === Stop Loss (Short) Stoppen und verlieren. ===
isSLs = input(false, "Stop Loss (Short)")
sls = input(6, "Stop Loss %", type=float, step=0.2, minval=0, maxval=100) / 100
short_call_sl = last_open_shortCondition * (1 + sls)
short_sl = isSLs and high >= short_call_sl and shortCondition == 0
// === /END

// === Trailing Stop, nachlaufend Stoppen. ===
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

// === Create Single Close für alle Abschlussbedingungen erstellen.  ===
closelong = long_sl or long_ts or longX
closeshort = short_sl or short_ts or shortX

// Get Last Close bekommen.
last_long_close := closelong ? time : nz(last_long_close[1])
last_short_close := closeshort ? time : nz(last_short_close[1])

// Check For Close Since Last Open (Seit dem letzten Öffnen auf Schließen hin prüfen.)
if closelong and last_long_close[1] > last_longCondition
    closelong := false

if closeshort and last_short_close[1] > last_shortCondition
    closeshort := false
// === /ENDE

////////////////////////////////////////////////////////////////////////////

// === Alarmeinstellungen ===
//alertcondition(longCondition==1, title='LONG', message='LONG')
//alertcondition(closelong==1, title='EXIT LONG', message='EXIT LONG')
//alertcondition(shortCondition==1, title='SHORT', message='SHORT')
//alertcondition(closeshort==1, title='EXIT SHORT', message='EXIT SHORT')
// === /END

////////////////////////////////////////////////////////////////////////////

// === Visuals & Debugs hier ===
// entferne "//", um den obigen Code zu überprüfen/debuggen.
// Signalformen
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
// === /ENDE

////////////////////////////////////////////////////////////////////////////
//                                                                        //
//   ENTFERNEN SIE DEN NACHFOLGENDEN CODE FÜR DIE STUDIENKONVERTIERUNG    //
//                                                                        //
////////////////////////////////////////////////////////////////////////////

// === Strategie Richtungswechsel ===
dir = input(title = "Strategy Direction", defval="Long") //, options=["Long", "Short", "Both"]
// === /END

// === Backtesting-Daten ===
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

// === Strategie ===
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
// === /ENDE

////////////////////////////////////////////////////////////////////////////
//                                                                        //
//                 ULTIMATE PINE INJECTOR V1.2                            //
//                                                                        //
//////////////////////===ANION=CODE=END====/////////////////////////////////