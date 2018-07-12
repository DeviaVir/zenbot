export default (conf) => {
  var active_notifiers = []
  for (var notifier in conf.notifiers) {
    if (conf.notifiers[notifier].on) {
      active_notifiers.push(require(`../plugins/notifiers/${notifier}`).default(conf.notifiers[notifier]))
    }
  }

  return {
    pushMessage: function(title, message) {
      if (conf.debug) {
        console.log(`${title}: ${message}`)
      }

      active_notifiers.forEach((notifier) => {
        if (conf.debug) {
          console.log(`Sending push message via ${notifier}`)
        }
        notifier.pushMessage(title, message)
      })
    },
  }
}
