$('.ticker-graph').each(function () {
  var dim = {
        width: 1280, height: 520,
        margin: { top: 20, right: 50, bottom: 20, left: 50 },
        ohlc: { height: 280 },
        indicator: { height: 90, padding: 15 }
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
                if(d.type === 'buy') return y(d.price)+5;
                if(d.type === 'sell') return y(d.price)-5;
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

    var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

    var timeAnnotation = techan.plot.axisannotation()
            .axis(xAxis)
            .format(d3.time.format('%c'))
            .width(140)
            .translate([0, dim.plot.height - 100]);

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
            .ticks(5)
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
            .ticks(5)
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
            .attr("x", 50)
            .text("zenbot");

    svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (dim.plot.height - 200) + ")");

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

    var accessor = candlestick.accessor(),
    indicatorPreRoll = 35;  // Don't show where indicators don't have data

    var first_run = true
    function withTrades (trades) {
        var poll = function () {
            var timeout = setTimeout(function () {
                $('.loading').show()
                $('.fa-spinner').show()
                $('body').css('backgroundColor', '#333')
            }, 10000)
        
            d3.csv("data.csv" + location.search, function(error, data) {
                clearTimeout(timeout)
                setTimeout(poll, 10000)
                $('.fa-spinner').hide()
                if (!data || !data[indicatorPreRoll]) {
                    $('.no-data').show()
                }
                else {
                    $('.no-data').hide()
                    $('.loading').hide()
                }
                if (!data) return
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

                  x.domain(techan.scale.plot.time(data.slice(indicatorPreRoll)).domain());
                  y.domain(techan.scale.plot.ohlc(data.slice(indicatorPreRoll)).domain());
                  yPercent.domain(techan.scale.plot.percent(y, accessor(data[indicatorPreRoll])).domain());
                  yVolume.domain(techan.scale.plot.volume(data).domain());

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

                  svg.select("g.tradearrow").datum(trades).call(tradearrow);

                  draw();

                  first_run = false
            });
        }
        if (!trades) {
            var _poll = poll
            poll = function () {
                d3.csv("trades.csv" + location.search, function (err, data) {
                    trades = data.map(function (row) {
                        return {
                            date: new Date(+row.Time),
                            type: row.Type,
                            price: +row.Price
                        }
                    })
                    _poll()
                })
            }
        }
        poll()
    }
    if (location.search.match(/sim_id=([^&]+)/)) {
        d3.csv("sim_trades.csv" + location.search, function (err, data) {
            var trades = data.map(function (row) {
                return {
                    date: new Date(+row.Time),
                    type: row.Type,
                    price: +row.Price
                }
            })
            withTrades(trades)
        })
    }
    else {
        withTrades()
    }

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
        svg.select("g.tradearrow").call(tradearrow);
    }
})

$('.logs').each(function () {
  var newest_time = ''
  var ids = [], oldest_time = '', updating = false

  function element_in_scroll(elem)
  {
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height() + 800;

    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height();

    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
  }

  $(document).scroll(function(e){
    if (element_in_scroll(".logs-end")) {
      backfill()
    }
  })

  function backfill () {
    if (updating) return
    updating = true
    $('.loader').css('visibility', 'visible')
    $.getJSON('/logs/data?oldest_time=' + oldest_time, function (data) {
      updating = false
      $('.loader').css('visibility', 'hidden')
      if (!data.logs || !data.logs.length) {
        return
      }
      var delay = 0
      data.logs.forEach(function (log) {
        if (ids.indexOf(log.id) !== -1) return
        var is_locked = false, is_newest = !newest_time
        if (is_newest) {
          newest_time = log.time
          updateTitle(log)
        }
        var $el = $('<div class="log-line' + (is_locked_line ? ' locked' : '') + (is_newest ? ' first' : '') + '" style="visibility:hidden" id="t__' + log.time + '">' + log.html + getPermalink(log) + '</div>')
        is_locked_line = false
        if (log.data && log.data.new_max_vol) {
          $el.addClass(log.data.zmi.indexOf('BULL') > 0 ? 'bull' : 'bear')
        }
        $('.logs').append($el)
        setTimeout(function () {
          $el.css('visibility', 'visible').css('display', 'block')
        }, delay)
        delay += 10
        ids.push(log.id)
        oldest_time = log.time
      })
    })
  }

  document.title = document.title.replace(/.+ \- /, '')
  var orig_title = document.title
  function updateTitle (log) {
    if (log.data && log.data.zmi) {
      if (log.data && log.data.new_max_vol) {
        log.data.zmi = log.data.zmi.replace('/', '*/')
        var orig_zmi = log.data.zmi
        var blink_on = false
        var blinks = 6
        ;(function blink () {
          setTimeout(function () {
            if (blink_on) {
              document.title = ''
            }
            else {
              document.title = orig_zmi + ' - ' + log.data.price + ' ' + orig_title
            }
            blink_on = !blink_on
            if (blinks--) blink()
          }, 400)
        })()
      }
      document.title = log.data.zmi + ' - ' + log.data.price + ' ' + orig_title
    }
  }

  function getPermalink (log) {
    var str = ' <small><a class="permalink" target="_blank" href="#t__' + (log.time) + '">[link]</a>'
    if (log.data && log.data.tweet && log.data.tweet.user) {
      str += ' <a href="https://twitter.com/' + log.data.tweet.user.screen_name + '/status/' + log.data.tweet.id_str + '">[tweet]</a>'
    }
    str += '</small>'
    return str
  }

  var timeout
  function poll () {
    if (updating) return
    updating = true
    $('.loader').css('visibility', 'visible')
    $.getJSON('/logs/data?newest_time=' + newest_time, function (data) {
      updating = false
      clearTimeout(timeout)
      $('.loader').css('visibility', 'hidden')
      $('.logs .first').removeClass('locked')
      var delay = data.logs.length * 10
      var $old_el = $('.log-line').eq(0)
      data.logs.reverse().forEach(function (log, idx) {
        if (ids.indexOf(log.id) !== -1) return
        $('.logs .first').removeClass('first')
        var $el = $('<div class="log-line first" style="visibility:hidden" id="t__' + (log.time) + '">' + log.html + getPermalink(log) + '</div>')
        $('.logs').prepend($el)
        setTimeout(function () {
          $el.css('visibility', 'visible').css('display', 'block')
        }, delay)
        delay -= 10
        ids.push(log.id)
        updateTitle(log)
        if (log.data && log.data.new_max_vol) {
          $el.addClass(log.data.zmi.indexOf('BULL') > 0 ? 'bull' : 'bear')
        }
        newest_time = log.time
      })
      timeout = setTimeout(function () {
        $('.logs .first').addClass('locked')
      }, 11000)
    })
  }

  var is_locked_line = false, pollInterval
  $('.logs').empty()
  is_locked_line = false
  var match = window.location.hash.match(/t__([^,]+)/)
  if (match) {
    oldest_time = parseInt(match[1], 10)
    newest_time = oldest_time
    is_locked_line = true
  }
  else {
    pollInterval = setInterval(poll, 10000)
  }
  backfill()
})