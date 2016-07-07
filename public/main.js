$('.logs').each(function () {
  var skip = 0, updating = false, start = new Date().getTime()

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
      if (updating) return
      skip += 1000
      updating = true
      $.getJSON('/logs?skip=' + skip, function (data) {
        data.logs.forEach(function (log) {
          $('.logs').append('<div class="log-line">' + log.html + '</div>')
        })
        updating = false
      })
    }
  })

  function poll () {
    $.getJSON('/logs/new?start=' + start, function (data) {
      data.logs.forEach(function (log) {
        $('.logs').prepend('<div class="log-line">' + log.html + '</div>')
      })
      start = new Date().getTime()
    })
  }

  setInterval(poll, 10000)
})