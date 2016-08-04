$('.ticker-graph').each(function () {
  var margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var parseDate = d3.time.format("%d-%b-%y").parse;

  var x = techan.scale.financetime()
      .range([0, width]);

  var y = d3.scale.linear()
      .range([height, 0]);

  var yVolume = d3.scale.linear()
      .range([y(0), y(0.2)]);

  var candlestick = techan.plot.candlestick()
      .xScale(x)
      .yScale(y);

  var sma0 = techan.plot.sma()
      .xScale(x)
      .yScale(y);

  var sma0Calculator = techan.indicator.sma()
      .period(10);

  var sma1 = techan.plot.sma()
      .xScale(x)
      .yScale(y);

  var sma1Calculator = techan.indicator.sma()
      .period(20);

  var volume = techan.plot.volume()
      .accessor(candlestick.accessor())
      .xScale(x)
      .yScale(yVolume);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

  var volumeAxis = d3.svg.axis()
      .scale(yVolume)
      .orient("right")
      .ticks(3)
      .tickFormat(d3.format(",.3s"));

  var timeAnnotation = techan.plot.axisannotation()
      .axis(xAxis)
      .format(d3.time.format('%Y-%m-%d'))
      .width(65)
      .translate([0, height]);

  var ohlcAnnotation = techan.plot.axisannotation()
      .axis(yAxis)
      .format(d3.format(',.2fs'));

  var volumeAnnotation = techan.plot.axisannotation()
      .axis(volumeAxis)
      .width(35);

  var crosshair = techan.plot.crosshair()
      .xScale(x)
      .yScale(y)
      .xAnnotation(timeAnnotation)
      .yAnnotation([ohlcAnnotation, volumeAnnotation]);

  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

  var defs = svg.append("defs");

  defs.append("clipPath")
      .attr("id", "ohlcClip")
    .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height);

  svg = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var ohlcSelection = svg.append("g")
      .attr("class", "ohlc")
      .attr("transform", "translate(0,0)");

  ohlcSelection.append("g")
      .attr("class", "volume")
      .attr("clip-path", "url(#ohlcClip)");

  ohlcSelection.append("g")
      .attr("class", "candlestick")
      .attr("clip-path", "url(#ohlcClip)");

  ohlcSelection.append("g")
      .attr("class", "indicator sma ma-0")
      .attr("clip-path", "url(#ohlcClip)");

  ohlcSelection.append("g")
      .attr("class", "indicator sma ma-1")
      .attr("clip-path", "url(#ohlcClip)");

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")");

  svg.append("g")
      .attr("class", "y axis")
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Price ($)");

  svg.append("g")
      .attr("class", "volume axis");

  svg.append('g')
      .attr("class", "crosshair ohlc");

  var data;

  function poll () {
    d3.csv("data.csv", function(error, csv) {
      var accessor = candlestick.accessor();

      data = csv.map(function(d) {
        return {
          date: new Date(+d.Time),
          open: +d.Open,
          high: +d.High,
          low: +d.Low,
          close: +d.Close,
          volume: +d.Volume
        };
      }).sort(function(a, b) { return d3.ascending(accessor.d(a), accessor.d(b)); });

      svg.select("g.candlestick").datum(data);
      svg.select("g.sma.ma-0").datum(sma0Calculator(data));
      svg.select("g.sma.ma-1").datum(sma1Calculator(data));
      svg.select("g.volume").datum(data);

      redraw();
    });
  }
  poll()

  function refreshIndicator(selection, indicator, data) {
    var datum = selection.datum();
    // Some trickery to remove old and insert new without changing array reference,
    // so no need to update __data__ in the DOM
    datum.splice.apply(datum, [0, datum.length].concat(data));
    selection.call(indicator);
  }

  function redraw() {
    var accessor = candlestick.accessor();

    x.domain(data.map(accessor.d));
    // Show only 150 points on the plot
    x.zoomable().domain([data.length-130, data.length]);

    // Update y scale min max, only on viewable zoomable.domain()
    y.domain(techan.scale.plot.ohlc(data.slice(data.length-130, data.length)).domain());
    yVolume.domain(techan.scale.plot.volume(data.slice(data.length-130, data.length)).domain());

    svg.select('g.x.axis').call(xAxis);
    svg.select('g.y.axis').call(yAxis);
    svg.select("g.volume.axis").call(volumeAxis);

    svg.select("g.candlestick").call(candlestick);
    // Recalculate indicators and update the SAME array and redraw moving average
    refreshIndicator(svg.select("g.sma.ma-0"), sma0, sma0Calculator(data));
    refreshIndicator(svg.select("g.sma.ma-1"), sma1, sma1Calculator(data));

    svg.select("g.volume").call(volume);

    svg.select("g.crosshair.candlestick").call(crosshair);

    setTimeout(poll, 10000);
  }
})