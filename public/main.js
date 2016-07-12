$('.logs').each(function () {
  var newest_time = ''
  var ids = [], oldest_time = ''

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
    $('.loader').css('visibility', 'visible')
    $.getJSON('/logs?oldest_time=' + oldest_time, function (data) {
      $('.loader').css('visibility', 'hidden')
      if (!data.logs || !data.logs.length) {
        return
      }
      var delay = 0
      data.logs.forEach(function (log) {
        if (ids.indexOf(log.id) !== -1) return
        var is_locked = false
        if (!newest_time) {
          newest_time = log.time
          updateTitle(log)
        }
        var $el = $('<div class="log-line' + (is_locked_line ? ' locked' : '') + '" style="visibility:hidden" id="t__' + log.time + '">' + log.html + getPermalink(log) + '</div>')
        is_locked_line = false
        if (log.data && log.data.new_max_vol) {
          $el.addClass(log.data.zmi.indexOf('BULL') > 0 ? 'bull' : 'bear')
        }
        $('.logs').append($el)
        setTimeout(function () {
          $el.css('visibility', 'visible').css('display', 'none')
          $el.fadeIn('slow')
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
    return ' <small><a class="permalink" target="_blank" href="#t__' + (log.time) + '">[link]</a></small>'
  }

  function poll () {
    $('.loader').css('visibility', 'visible')
    $.getJSON('/logs?newest_time=' + newest_time, function (data) {
      $('.loader').css('visibility', 'hidden')
      var delay = data.logs.length * 10
      var $old_el = $('.log-line').eq(0)
      data.logs.reverse().forEach(function (log, idx) {
        if (ids.indexOf(log.id) !== -1) return
        $('.logs .first').removeClass('first')
        var $el = $('<div class="log-line first" style="visibility:hidden" id="t__' + (log.time) + '">' + log.html + getPermalink(log) + '</div>')
        $('.logs').prepend($el)
        setTimeout(function () {
          $el.css('visibility', 'visible').css('display', 'none')
          $el.fadeIn('slow')
        }, delay)
        delay -= 10
        ids.push(log.id)
        updateTitle(log)
        if (log.data && log.data.new_max_vol) {
          $el.addClass(log.data.zmi.indexOf('BULL') > 0 ? 'bull' : 'bear')
        }
        newest_time = log.time
      })
    })
  }

  var is_locked_line = false, pollInterval
  $('.logs').empty()
  is_locked_line = false
  var match = window.location.hash.match(/t__([^,]+)/)
  if (match) {
    oldest_time = parseInt(match[1], 10)
    newest_time = oldest_time
    clearInterval(pollInterval)
    is_locked_line = true
  }
  else {
    pollInterval = setInterval(poll, 10000)
  }
  backfill()
})