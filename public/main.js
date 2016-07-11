$('.logs').each(function () {
  var updating = false, newest_time = new Date().getTime()
  var ids = [], oldest_time = new Date().getTime()

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
    $.getJSON('/logs?oldest_time=' + oldest_time, function (data) {
      updating = false
      if (!data.logs || !data.logs.length) {
        return
      }
      data.logs.forEach(function (log) {
        if (ids.indexOf(log.id) !== -1) return
        $('.logs').append('<div class="log-line">' + log.html + '</div>')
        ids.push(log.id)
        oldest_time = log.time
      })
    })
  }

  function poll () {
    if (updating) return
    updating = true
    $.getJSON('/logs?newest_time=' + newest_time, function (data) {
      updating = false
      data.logs.reverse().forEach(function (log) {
        if (ids.indexOf(log.id) !== -1) return
        $('.logs').prepend('<div class="log-line">' + log.html + '</div>')
        ids.push(log.id)
        if (log.data && log.data.zmi) {
          document.title = document.title.replace(/.+ \- /, '')
          if (log.data.rs && log.data.rs.new_max_vol) {
            log.data.zmi = log.data.zmi.replace('/', '*/')
          }
          document.title = log.data.zmi + ' - ' + document.title
        }
        newest_time = log.time
      })
    })
  }

  setInterval(poll, 10000)
  backfill()
})