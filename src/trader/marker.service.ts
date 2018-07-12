import crypto from 'crypto'
import { Collection } from 'mongodb'

export interface Marker {
  id: string
  _id: string
  selector: string
  from: number
  to: number
  oldest_time: number
  newest_time: number
}

export class MarkerService {
  private markerCollection: Collection

  constructor(collectionServiceInstance, private selector: string) {
    this.markerCollection = collectionServiceInstance.getResumeMarkers()
  }

  newMarker() {
    const id = crypto.randomBytes(4).toString('hex')

    return {
      id,
      _id: id,
      selector: this.selector,
      to: null,
      from: null,
      oldest_time: null,
    } as Marker
  }

  async saveMarker(marker: Marker) {
    await this.markerCollection.save(marker)
  }
}
