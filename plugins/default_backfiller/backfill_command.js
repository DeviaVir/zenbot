module.exports = function container (get, set, clear) {
  var program = get('program')
  var launcher = get('launcher')
  var backfiller = get('backfiller')
  return {
    name: 'backfill',
    define: function () {
      program
        .command('backfill')
        .description('2. run the backfiller')
        .action(function (options) {
          launcher(backfiller, [], options)
        })
    }
  }
}