program
      .command('launch <plugin-name>')
      .description('(optional) launch a plugin within zenbot\'s environment')
      .action(function (plugin, options) {
        zenbot('launch', plugin, options)
      })