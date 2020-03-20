module.exports = function adamant (config) {
  const api = require('adamant-api')({passPhrase: config.fromPassphrase, node: config.nodes, logLevel: 'error'}, null)
  var adamant = {
    pushMessage: function(title, message) {
      config.toAddresses.forEach(address => {
        if (address) 
          var result = api.send(config.fromPassphrase, address, title + ': ' + message, 'message')
        if (!result.success) {
          console.error(`Message to address ${address} was not accepted by ADAMANT node: ${result.error}.`)
        }
      })
    }
  }
  return adamant
}
