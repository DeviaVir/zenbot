var c = module.exports = {}

// mongo stuff
c.mongo_host = process.env.MONGODB_PORT_27017_TCP_ADDR || 'localhost'
c.mongo_port = 27017
c.mongo_db = 'zenbot4'
c.mongo_username = null // normally not needed
c.mongo_password = null
