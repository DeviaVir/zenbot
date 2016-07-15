program
      .command('remember [key] [value]')
      .description('(optional) show zenbot\'s memory')
      .action(function (key, value, options) {
        zenbot('remember', key, value, options)
      })