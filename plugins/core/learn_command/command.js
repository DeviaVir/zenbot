module.exports = function container (get, set, clear) {
  return null
  program
      .command('learn')
      .description('3. run the machine learner')
      .option('-d, --duration <seconds>', 'learning duration in seconds')
      .option('-c, --concurrency <int>', 'number of concurrent simulations', Number, require('os').cpus().length)
      .option('-t, --throttle <load>', 'pause the simulation if load average goes above this', Number, 10)
      .action(function (options) {
        zenbot('learn', options)
      })
}