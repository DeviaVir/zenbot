import crypto from 'crypto'
import { Collection } from 'mongodb'

interface Period {
  id: string
  _id: string
  size: string
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  close_time: number
  selector: string
  session_id: string
}

export class PeriodService {
  public period: Period
  private periodCollection: Collection<Period>

  constructor(collectionServiceInstance, private selector: string) {
    this.periodCollection = collectionServiceInstance.getPeriods()
  }

  async savePeriod(period: Period, sessionId: string) {
    if (!period.id) {
      period.id = crypto.randomBytes(4).toString('hex')
      period.selector = this.selector
      period.session_id = sessionId
    }

    period._id = period.id

    await this.periodCollection.save(period)
  }
}
