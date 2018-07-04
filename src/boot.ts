import EventEmitter from 'events'
import { MongoClient } from 'mongodb'

import Config from './config'
import { IZenbotConfig } from '@types'

const connectToMongo = async ({ username, password, authMechanism, connectionString, host, port, replicaSet, db }) => {
  const makeConnectionString = () => {
    if (connectionString) return connectionString

    if (username) {
      const uname = encodeURIComponent(username)
      const pword = password ? encodeURIComponent(password) : null
      const authStr = !pword ? `${uname}@` : `${uname}:${pword}@`
      const baseStr = `mongodb://${authStr}${host}:${port}/${db}`

      // prettier-ignore
      return replicaSet && authMechanism
        ? `${baseStr}?replicaSet=${replicaSet}&authMechanism=${authMechanism}`
        : replicaSet ? `${baseStr}?replicaSet=${replicaSet}`
        : authMechanism ? `${baseStr}?authMechanism=${authMechanism}`
        : baseStr
    }
  }

  const conStr = makeConnectionString()
  const mongo = await MongoClient.connect(conStr)
  return mongo.db(db)
}

export default async () => {
  const zenbot: IZenbotConfig = Config()

  zenbot.conf.eventBus = new EventEmitter()
  zenbot.conf.db.mongo = await connectToMongo(zenbot.conf.mongo)

  return zenbot
}
