import moment from 'moment'
import readline from 'readline'

export default (trade_id, { pingCount, time }) => {
  if (!pingCount || !time) {
    readline.clearLine(process.stdout, 0)
    // prettier-ignore
    const str = `${pingCount} trades processed so far. The most recently processed trade happened ${moment(time).fromNow()}.`

    process.stdout.write(str)
    readline.cursorTo(process.stdout, 0)
  }
}
