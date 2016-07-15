program
      .command('forget [key]')
      .description('(optional) forget learned stuff')
      .action(function (key, options) {
        zenbot('forget', key, options)
      })