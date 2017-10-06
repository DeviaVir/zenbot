module.exports = function container (get) {
  var c = get('conf')

  return {
    pushMessage: function (title, message) {
      if (c.debug) {
        console.log(`${title}: ${message}`)
      }

      for (var notifier in c.notifiers) {
        if (c.notifiers[notifier].on) {
          if (c.debug) {
            console.log(`Sending push message via ${notifier}`)
          }
          get(`notifiers.${notifier}`).pushMessage(c.notifiers[notifier], title, message)
        }
      }
    }
  }
}
