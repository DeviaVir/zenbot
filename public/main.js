$('.logs').each(function () {
  var skip = 0, updating = false, start = new Date().getTime()
  var ids = []

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
        updating = false
        if (!data.logs || !data.logs.length) {
          skip -= 1000
          return
        }
        data.logs.forEach(function (log) {
          if (ids.indexOf(log.id) !== -1) return
          $('.logs').append('<div class="log-line">' + log.html + '</div>')
          ids.push(log.id)
        })
      })
    }
  })

  function poll () {
    $.getJSON('/logs/new?start=' + start, function (data) {
      data.logs.reverse().forEach(function (log) {
        if (ids.indexOf(log.id) !== -1) return
        $('.logs').prepend('<div class="log-line">' + log.html + '</div>')
        ids.push(log.id)
      })
      start = new Date().getTime()
    })
  }

  setInterval(poll, 10000)
})