module.exports = function container (get, set, clear) {
  return function record_method (program) {
    return program
      .command('record')
      .description('1. run the recorder')
      .option('--tweet', 'live tweet big buys/sells')
      .action(function (options) {
        zenbot('launch', 'default_recorder', options)
      })
  }
}