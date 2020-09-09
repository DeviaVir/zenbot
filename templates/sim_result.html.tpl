<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{{symbol}} sim result</title>
  <style type="text/css">
html {
  height: 100%;
}

body {
  font: 10px sans-serif;
  background-color: #1f2d35;
  color: #888;
  position: relative;
}

svg {
    margin: 50px 0 0 0;
    width: 100%;
    height: auto;
    z-index: 2;
}

.axis path,
.axis line {
    fill: none;
    stroke: #444;
    shape-rendering: crispEdges;
}

.axis.x path {
    stroke: none;
}

text {
    fill: #888;
}

text.symbol {
    fill: #BBBBBB;
}

path {
    fill: none;
    stroke-width: 1;
}

path.candle {
    stroke: #888;
}

path.candle.up {
    stroke: rgb(85, 255, 14);
}

path.candle.down {
    fill: rgb(232, 87, 35);
    stroke: #944329;
}

.close.annotation.up path {
    stroke: #8ff;
    stroke-width: 1;
    fill: #8ff;
}

.close.annotation.up text {
    fill: #000;
}

path.volume {
    fill: #588bbd;
}

.indicator-plot path.line {
    fill: none;
    stroke-width: 1;
}

.ma-0 path.line {
    stroke: #1f77b4;
}

.ma-1 path.line {
    stroke: #aec7e8;
}

.ma-2 path.line {
    stroke: #ff7f0e;
}

button {
    position: absolute;
    right: 110px;
    top: 25px;
}

path.macd {
    stroke: #a0f;
}

path.signal {
    stroke: #0f0;
}

path.difference {
    fill: #35474c;
}

path.rsi {
    stroke: #09d;
}

path.overbought {
    stroke: #9f9;
    stroke-dasharray: 1, 5;
}

path.oversold {
    stroke: #f99;
    stroke-dasharray: 1, 5;
}

path.middle, path.zero {
    stroke: #888;
    stroke-opacity: 0.5;
    stroke-dasharray: 1, 5;
}

.analysis path, .analysis circle {
    stroke: blue;
    stroke-width: 0.8;
}

.trendline circle {
    stroke-width: 0;
    display: none;
}

.mouseover .trendline path {
    stroke-width: 1.2;
}

.mouseover .trendline circle {
    stroke-width: 1;
    display: inline;
}

.dragging .trendline path, .dragging .trendline circle {
    stroke: darkblue;
}

.interaction path, .interaction circle {
    pointer-events: all;
}

.interaction .body {
    cursor: move;
}

.trendlines .interaction .start, .trendlines .interaction .end {
    cursor: nwse-resize;
}

.supstance path {
    stroke-dasharray: 2, 2;
}

.supstances .interaction path {
    pointer-events: all;
    cursor: ns-resize;
}

.mouseover .supstance path {
    stroke-width: 1.5;
}

.dragging .supstance path {
    stroke: darkblue;
}

.crosshair {
    cursor: crosshair;
}

.crosshair path.wire {
    stroke: #fff;
    stroke-opacity: 0.5;
    stroke-dasharray: 1, 5;
}

.crosshair .axisannotation path {
    fill: #000;
    stroke: #fff;
}

.axisannotation.y path {
    stroke: #fff;
}

.tradearrow path.tradearrow {
    stroke: black;
}

.tradearrow path.buy {
    fill: #00ff00;
}

.tradearrow path.sell {
    fill: #ff0056;
}

.tradearrow path.highlight {
    fill: none;
    stroke-width: 2;
}

.tradearrow path.highlight.buy {
    stroke: #0000FF;
}

.tradearrow path.highlight.sell {
    stroke: #9900FF;
}

.loading {
    width: 50%;
    height: 50%;
    overflow: auto;
    margin: auto;
    position: absolute;
    top: 0; left: 0; bottom: 0; right: 0;
    text-align: center;
    font-size: 80px;
    z-index: 1;
    color: #888;
}

.no-data {
    display: none;
    color: #888;
    font-size: 80px;
    text-align: center;
} 

.options {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 3;
}

.footer {
    position: fixed;
    right: 20px;
    bottom: 20px;
    color: #aac;
    font-size: 1.2em;
}

.footer a {
    color: cyan;
    text-decoration: none;
}
pre {
    font-size: 2em;
}
  </style>
</head>
<body>
  <div class="ticker-graph"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
  <script src="https://d3js.org/d3.v4.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/techan@0.8.0/dist/techan.min.js"></script>
  <script>
var withData = function (data, trades) {
  var dim = {
      width: 1280, height: 520,
      margin: { top: 20, right: 50, bottom: 20, left: 50 },
      ohlc: { height: 450 }
  };
  dim.plot = {
      width: dim.width - dim.margin.left - dim.margin.right,
      height: dim.height - dim.margin.top - dim.margin.bottom
  };

  var yInit, yPercentInit, zoomableInit;

  var x = techan.scale.financetime()
          .range([0, dim.plot.width]);

  var y = d3.scaleLinear()
          .range([dim.ohlc.height, 0]);

  var zoom = d3.zoom()
          .on("zoom", zoomed);

  var yPercent = y.copy();   // Same as y at this stage, will get a different domain later

  var yVolume = d3.scaleLinear()
          .range([y(0), y(1)]);

  var candlestick = techan.plot.candlestick()
          .xScale(x)
          .yScale(y);

  var tradearrow = techan.plot.tradearrow()
          .xScale(x)
          .yScale(y)
          .y(function(d) {
              // Display the buy and sell arrows a bit above and below the price, so the price is still visible
              if(d.type === 'buy') return y(d.price)+5;
              if(d.type === 'sell') return y(d.price)-5;
              else return y(d.price);
          });

  var ema2 = techan.plot.ema()
    .xScale(x)
    .yScale(y);

  var volume = techan.plot.volume()
          .accessor(candlestick.accessor())   // Set the accessor to a ohlc accessor so we get highlighted bars
          .xScale(x)
          .yScale(yVolume);

  var xAxis = d3.axisBottom(x);

  var timeAnnotation = techan.plot.axisannotation()
          .axis(xAxis)
          .orient('bottom')
          .format(d3.timeFormat('%c'))
          .width(140)
          .translate([0, dim.plot.height]);

  var yAxis = d3.axisRight(y);

  var ohlcAnnotation = techan.plot.axisannotation()
          .axis(yAxis)
          .orient('right')
          .format(d3.format(',.8f'))
          .translate([x(1), 0]);

  var percentAxis = d3.axisLeft(yPercent)
          .tickFormat(d3.format('+.1%'));

  var percentAnnotation = techan.plot.axisannotation()
          .axis(percentAxis)
          .orient('left');

  var volumeAxis = d3.axisRight(yVolume)
          .ticks(3)
          .tickFormat(d3.format(",.3s"));

  var volumeAnnotation = techan.plot.axisannotation()
          .axis(volumeAxis)
          .orient("right")
          .width(35);

  var ohlcCrosshair = techan.plot.crosshair()
          .xScale(timeAnnotation.axis().scale())
          .yScale(ohlcAnnotation.axis().scale())
          .xAnnotation(timeAnnotation)
          .yAnnotation([ohlcAnnotation, percentAnnotation, volumeAnnotation])
          .verticalWireRange([0, dim.plot.height]);

  var svg = d3.select("body").append("svg")
          .attr("viewBox", "0 0 " + dim.width + " " + dim.height)
          .attr("width", dim.width)
          .attr("height", dim.height);

  var defs = svg.append("defs");

  defs.append("clipPath")
          .attr("id", "ohlcClip")
      .append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", dim.plot.width)
          .attr("height", dim.ohlc.height);

  svg = svg.append("g")
          .attr("transform", "translate(" + dim.margin.left + "," + dim.margin.top + ")");

  svg.append('text')
          .attr("class", "symbol")
          .attr("x", 50)
          .text("{{symbol}}");

  svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + (dim.plot.height - 30) + ")");

  var ohlcSelection = svg.append("g")
          .attr("class", "ohlc")
          .attr("transform", "translate(0,0)");

  ohlcSelection.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(" + x(1) + ",0)")
      .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", -12)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Price");

  ohlcSelection.append("g")
          .attr("class", "close annotation up")
          .attr("font-weight", "900")

  ohlcSelection.append("g")
          .attr("class", "volume")
          .attr("clip-path", "url(#ohlcClip)");

  ohlcSelection.append("g")
          .attr("class", "candlestick")
          .attr("clip-path", "url(#ohlcClip)");

  ohlcSelection.append("g")
          .attr("class", "indicator ema ma-2")
          .attr("clip-path", "url(#ohlcClip)");

  ohlcSelection.append("g")
          .attr("class", "percent axis");

  ohlcSelection.append("g")
          .attr("class", "volume axis");

  // Add trendlines and other interactions last to be above zoom pane
  svg.append('g')
          .attr("class", "crosshair ohlc");

  svg.append("g")
          .attr("class", "tradearrow")
          .attr("clip-path", "url(#ohlcClip)");

  var accessor = candlestick.accessor();

  data = data.map(function (d) {
    d.date = new Date(d.time)
    return d
  })
  data.sort(function(a, b) { return d3.ascending(accessor.d(a), accessor.d(b)); });
  trades = trades.map(function (t) {
    t.date = new Date(t.time)
    return t
  })
  trades.sort(function(a, b) { return d3.ascending(accessor.d(a), accessor.d(b)); });

  $('body').css('backgroundColor', '#1f2d35')
  x.domain(techan.scale.plot.time(data).domain());
  y.domain(techan.scale.plot.ohlc(data).domain());
  yPercent.domain(techan.scale.plot.percent(y, accessor(data[0])).domain());
  yVolume.domain(techan.scale.plot.volume(data).domain());

  svg.select("g.candlestick").datum(data)
  var last = data[data.length-1]
  if (!last) {
    return
  }
  svg.select("g.volume").datum(data)
  svg.select("g.ema.ma-2").datum(techan.indicator.ema().period({{trend_ema_period}})(data)).call(ema2);
  svg.select("g.tradearrow").datum(trades).call(tradearrow);

  // Stash for zooming
  zoomableInit = x.zoomable().domain([0, data.length]).copy(); // Zoom in a little to hide indicator preroll
  yInit = y.copy();
  yPercentInit = yPercent.copy();

  draw();

  function draw() {
    svg.select("g.x.axis").call(xAxis);
    svg.select("g.ohlc .axis").call(yAxis);
    svg.select("g.volume.axis").call(volumeAxis);
    svg.select("g.percent.axis").call(percentAxis);
    svg.select("g.candlestick").call(candlestick);
    svg.select("g.volume").call(volume);
    svg.select("g.crosshair.ohlc").call(ohlcCrosshair).call(zoom);
    svg.select("g.tradearrow").call(tradearrow);
    svg.select("g .ema.ma-2").call(ema2.refresh).call(zoom);
  }

  function zoomed() {
    x.zoomable().domain(d3.event.transform.rescaleX(zoomableInit).domain());
    y.domain(d3.event.transform.rescaleY(yInit).domain());
    yPercent.domain(d3.event.transform.rescaleY(yPercentInit).domain());

    draw();
  }
}
  </script>
  <script>
{{code}}
withData(data, trades)
  </script>
  <pre><code>{{output}}</code></pre>
</body>
</html>
