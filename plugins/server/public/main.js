$('.ticker-graph').each(function () {
  var dim = {
        width: 1200, height: 600,
        margin: { top: 20, right: 50, bottom: 10, left: 50 },
        ohlc: { height: 420 },
        indicator: { height: 70, padding: 10 }
    };
    dim.plot = {
        width: dim.width - dim.margin.left - dim.margin.right,
        height: dim.height - dim.margin.top - dim.margin.bottom
    };
    dim.indicator.top = dim.ohlc.height+dim.indicator.padding;
    dim.indicator.bottom = dim.indicator.top+dim.indicator.height+dim.indicator.padding;

    var indicatorTop = d3.scale.linear()
            .range([dim.indicator.top, dim.indicator.bottom]);

    var x = techan.scale.financetime()
            .range([0, dim.plot.width]);

    var y = d3.scale.linear()
            .range([dim.ohlc.height, 0]);

    var yPercent = y.copy();   // Same as y at this stage, will get a different domain later

    var yVolume = d3.scale.linear()
            .range([y(0), y(1)]);

    var candlestick = techan.plot.candlestick()
            .xScale(x)
            .yScale(y);



    var macdIndicator = techan.indicator.macd()
    var rsiIndicator = techan.indicator.rsi()
    var sma0Indicator = techan.indicator.sma().period(10)
    var sma1Indicator = techan.indicator.sma().period(20)
    var ema2Indicator = techan.indicator.ema().period(50)

    var tradearrow = techan.plot.tradearrow()
            .xScale(x)
            .yScale(y)
            .y(function(d) {
                // Display the buy and sell arrows a bit above and below the price, so the price is still visible
                if(d.type === 'buy') return y(d.low)+5;
                if(d.type === 'sell') return y(d.high)-5;
                else return y(d.price);
            });

    var sma0 = techan.plot.sma()
            .xScale(x)
            .yScale(y);

    var sma1 = techan.plot.sma()
            .xScale(x)
            .yScale(y);

    var ema2 = techan.plot.ema()
            .xScale(x)
            .yScale(y);

    var volume = techan.plot.volume()
            .accessor(candlestick.accessor())   // Set the accessor to a ohlc accessor so we get highlighted bars
            .xScale(x)
            .yScale(yVolume);

/*
    var trendline = techan.plot.trendline()
            .xScale(x)
            .yScale(y);

    var supstance = techan.plot.supstance()
            .xScale(x)
            .yScale(y);
*/

    var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

    var timeAnnotation = techan.plot.axisannotation()
            .axis(xAxis)
            .format(d3.time.format('%c'))
            .width(140)
            .translate([0, dim.plot.height]);

    var yAxis = d3.svg.axis()
            .scale(y)
            .orient("right");

    var ohlcAnnotation = techan.plot.axisannotation()
            .axis(yAxis)
            .format(d3.format(',.2fs'))
            .translate([x(1), 0]);

    var closeAnnotation = techan.plot.axisannotation()
            .axis(yAxis)
            .accessor(candlestick.accessor())
            .format(d3.format(',.2fs'))
            .width(40)
            .translate([x(1), 0]);

    var percentAxis = d3.svg.axis()
            .scale(yPercent)
            .orient("left")
            .tickFormat(d3.format('+.1%'));

    var percentAnnotation = techan.plot.axisannotation()
            .axis(percentAxis);

    var volumeAxis = d3.svg.axis()
            .scale(yVolume)
            .orient("right")
            .ticks(3)
            .tickFormat(d3.format(",.3s"));

    var volumeAnnotation = techan.plot.axisannotation()
            .axis(volumeAxis)
            .width(35);

    var macdScale = d3.scale.linear()
            .range([indicatorTop(0)+dim.indicator.height, indicatorTop(0)]);

    var rsiScale = macdScale.copy()
            .range([indicatorTop(1)+dim.indicator.height, indicatorTop(1)]);

    var macd = techan.plot.macd()
            .xScale(x)
            .yScale(macdScale);

    var macdAxis = d3.svg.axis()
            .scale(macdScale)
            .ticks(3)
            .orient("right");

    var macdAnnotation = techan.plot.axisannotation()
            .axis(macdAxis)
            .format(d3.format(',.2fs'))
            .translate([x(1), 0]);

    var macdAxisLeft = d3.svg.axis()
            .scale(macdScale)
            .ticks(3)
            .orient("left");

    var macdAnnotationLeft = techan.plot.axisannotation()
            .axis(macdAxisLeft)
            .format(d3.format(',.2fs'));

    var rsi = techan.plot.rsi()
            .xScale(x)
            .yScale(rsiScale);

    var rsiAxis = d3.svg.axis()
            .scale(rsiScale)
            .ticks(3)
            .orient("right");

    var rsiAnnotation = techan.plot.axisannotation()
            .axis(rsiAxis)
            .format(d3.format(',.2fs'))
            .translate([x(1), 0]);

    var rsiAxisLeft = d3.svg.axis()
            .scale(rsiScale)
            .ticks(3)
            .orient("left");

    var rsiAnnotationLeft = techan.plot.axisannotation()
            .axis(rsiAxisLeft)
            .format(d3.format(',.2fs'));

    var ohlcCrosshair = techan.plot.crosshair()
            .xScale(timeAnnotation.axis().scale())
            .yScale(ohlcAnnotation.axis().scale())
            .xAnnotation(timeAnnotation)
            .yAnnotation([ohlcAnnotation, percentAnnotation, volumeAnnotation])
            .verticalWireRange([0, dim.plot.height]);

    var macdCrosshair = techan.plot.crosshair()
            .xScale(timeAnnotation.axis().scale())
            .yScale(macdAnnotation.axis().scale())
            .xAnnotation(timeAnnotation)
            .yAnnotation([macdAnnotation, macdAnnotationLeft])
            .verticalWireRange([0, dim.plot.height]);

    var rsiCrosshair = techan.plot.crosshair()
            .xScale(timeAnnotation.axis().scale())
            .yScale(rsiAnnotation.axis().scale())
            .xAnnotation(timeAnnotation)
            .yAnnotation([rsiAnnotation, rsiAnnotationLeft])
            .verticalWireRange([0, dim.plot.height]);

    var svg = d3.select("body").append("svg")
            .attr("viewBox", "0 0 1200 600")
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

    defs.selectAll("indicatorClip").data([0, 1])
        .enter()
            .append("clipPath")
            .attr("id", function(d, i) { return "indicatorClip-" + i; })
        .append("rect")
            .attr("x", 0)
            .attr("y", function(d, i) { return indicatorTop(i); })
            .attr("width", dim.plot.width)
            .attr("height", dim.indicator.height);

    svg = svg.append("g")
            .attr("transform", "translate(" + dim.margin.left + "," + dim.margin.top + ")");

    svg.append('text')
            .attr("class", "symbol")
            .attr("x", 20)
            .text("zenbot");

    svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + dim.plot.height + ")");

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
            .attr("class", "close annotation up");

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

    ohlcSelection.append("g")
            .attr("class", "indicator ema ma-2")
            .attr("clip-path", "url(#ohlcClip)");

    ohlcSelection.append("g")
            .attr("class", "percent axis");

    ohlcSelection.append("g")
            .attr("class", "volume axis");

    var indicatorSelection = svg.selectAll("svg > g.indicator").data(["macd", "rsi"]).enter()
             .append("g")
                .attr("class", function(d) { return d + " indicator"; });

    indicatorSelection.append("g")
            .attr("class", "axis right")
            .attr("transform", "translate(" + x(1) + ",0)");

    indicatorSelection.append("g")
            .attr("class", "axis left")
            .attr("transform", "translate(" + x(0) + ",0)");

    indicatorSelection.append("g")
            .attr("class", "indicator-plot")
            .attr("clip-path", function(d, i) { return "url(#indicatorClip-" + i + ")"; });

    // Add trendlines and other interactions last to be above zoom pane
    svg.append('g')
            .attr("class", "crosshair ohlc");

    svg.append("g")
            .attr("class", "tradearrow")
            .attr("clip-path", "url(#ohlcClip)");

    svg.append('g')
            .attr("class", "crosshair macd");

    svg.append('g')
            .attr("class", "crosshair rsi");

/*
    svg.append("g")
            .attr("class", "trendlines analysis")
            .attr("clip-path", "url(#ohlcClip)");
    svg.append("g")
            .attr("class", "supstances analysis")
            .attr("clip-path", "url(#ohlcClip)");
*/

    var accessor = candlestick.accessor(),
    indicatorPreRoll = 35;  // Don't show where indicators don't have data

    var first_run = true
    function poll () {
        var timeout = setTimeout(function () {
            $('.loading').css('visibility', 'visible')
            $('body').css('backgroundColor', '#333')
        }, 10000)
      d3.csv("data.csv" + location.search, function(error, data) {
        clearTimeout(timeout)
        setTimeout(poll, 10000)
        if (!data) return
        $('.loading').css('visibility', 'hidden')
        $('body').css('backgroundColor', '#1f2d35')
          data = data.map(function(d) {
              return {
                  date: new Date(+d.Time),
                  open: +d.Open,
                  high: +d.High,
                  low: +d.Low,
                  close: +d.Close,
                  volume: +d.Volume,
                  caption: d.Caption
              };
          }).sort(function(a, b) { return d3.ascending(accessor.d(a), accessor.d(b)); });
          if (!data[indicatorPreRoll]) return

          //if (first_run) {
          /*
          var trans = zoom.translate()
          var scale = zoom.scale()
          */
          x.domain(techan.scale.plot.time(data.slice(indicatorPreRoll)).domain());
          /*
          zoom.translate(trans);
          zoom.scale(scale);
          */
          y.domain(techan.scale.plot.ohlc(data.slice(indicatorPreRoll)).domain());
          yPercent.domain(techan.scale.plot.percent(y, accessor(data[indicatorPreRoll])).domain());
          yVolume.domain(techan.scale.plot.volume(data).domain());

          var trendlineData = [
              { start: { date: new Date(2014, 2, 11), value: 72.50 }, end: { date: new Date(2014, 5, 9), value: 63.34 } },
              { start: { date: new Date(2013, 10, 21), value: 43 }, end: { date: new Date(2014, 2, 17), value: 70.50 } }
          ];

          var supstanceData = [
              { start: new Date(2014, 2, 11), end: new Date(2014, 5, 9), value: 63.64 },
              { start: new Date(2013, 10, 21), end: new Date(2014, 2, 17), value: 55.50 }
          ];

          var trades = []
          /*
          [
              { date: data[67].date, type: "buy", price: data[67].low, low: data[67].low, high: data[67].high },
              { date: data[100].date, type: "sell", price: data[100].high, low: data[100].low, high: data[100].high },
              { date: data[130].date, type: "buy", price: data[130].low, low: data[130].low, high: data[130].high },
              { date: data[170].date, type: "sell", price: data[170].low, low: data[170].low, high: data[170].high }
          ];
          */

          svg.select("g.candlestick").datum(data)
          var last = data[data.length-1]
          if (!last) {
            return
          }
          document.title = last.caption + ' - zenbot'
          svg.select(".symbol")
            .text(last.caption)
          svg.select("g.volume").datum(data)

          svg.select("g.close.annotation").remove()
            ohlcSelection.append("g")
                .attr("class", "close annotation up")
                .datum([last])
                .call(closeAnnotation);

          var macdData = macdIndicator(data);
            macdScale.domain(techan.scale.plot.macd(macdData).domain());
            var rsiData = rsiIndicator(data);
            rsiScale.domain(techan.scale.plot.rsi(rsiData).domain());
            if (first_run) {
                svg.select("g.macd .indicator-plot").datum(macdData)
                svg.select("g.rsi .indicator-plot").datum(rsiData)
            }
            refreshIndicator(svg.select("g.macd .indicator-plot"), macd, macdData);
            refreshIndicator(svg.select("g.rsi .indicator-plot"), rsi, rsiData);
            var sma0Data = sma0Indicator(data)
            var sma1Data = sma1Indicator(data)
            var ema2Data = ema2Indicator(data)
            refreshIndicator(svg.select("g .sma.ma-0"), sma0, sma0Data);
            refreshIndicator(svg.select("g .sma.ma-1"), sma1, sma1Data);
            refreshIndicator(svg.select("g .ema.ma-2"), ema2, ema2Data);
            //svg.select("g.rsi .indicator-plot").call(rsi);

          //svg.select("g.crosshair.ohlc").call(ohlcCrosshair).call(zoom);
          //svg.select("g.crosshair.macd").call(macdCrosshair).call(zoom);
          //svg.select("g.crosshair.rsi").call(rsiCrosshair).call(zoom);
          //svg.select("g.trendlines").datum(trendlineData).call(trendline).call(trendline.drag);
          //svg.select("g.supstances").datum(supstanceData).call(supstance).call(supstance.drag);

          //svg.select("g.tradearrow").datum(trades).call(tradearrow);

          draw();

          // Associate the zoom with the scale after a domain has been applied
          if (first_run) {
            /*
            var zoomable = x.zoomable();
            zoomable.domain([indicatorPreRoll, data.length]); // Zoom in a little to hide indicator preroll
            zoom.x(zoomable) //.y(y);
            */
            //zoomPercent.y(yPercent);
          }
          first_run = false
      });
    }
    poll()

    function refreshIndicator(selection, indicator, data) {
        var datum = selection.datum();
        if (!datum) {
            selection.datum(data)
            datum = selection.datum()
        }
        // Some trickery to remove old and insert new without changing array reference,
        // so no need to update __data__ in the DOM
        if (Array.isArray(datum)) {
            datum.splice.apply(datum, [0, datum.length].concat(data));
        }
        selection.call(indicator);
    }

    function draw() {
        //zoomPercent.translate(zoom.translate());
        //zoomPercent.scale(zoom.scale());

        svg.select("g.x.axis").call(xAxis);
        svg.select("g.ohlc .axis").call(yAxis);
        svg.select("g.volume.axis").call(volumeAxis);
        svg.select("g.percent.axis").call(percentAxis);
        svg.select("g.macd .axis.right").call(macdAxis);
        svg.select("g.rsi .axis.right").call(rsiAxis);
        svg.select("g.macd .axis.left").call(macdAxisLeft);
        svg.select("g.rsi .axis.left").call(rsiAxisLeft);
        svg.select("g.candlestick").call(candlestick);
        svg.select("g.volume").call(volume);
        svg.select("g.crosshair.ohlc").call(ohlcCrosshair);
        svg.select("g.crosshair.macd").call(macdCrosshair);
        svg.select("g.crosshair.rsi").call(rsiCrosshair);
        //svg.select("g.macd .indicator-plot").call(macd);
        //svg.select("g.trendlines").call(trendline);
        //svg.select("g.supstances").call(supstance);
        //svg.select("g.tradearrow").call(tradearrow);
    }
})