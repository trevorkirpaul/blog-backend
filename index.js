const mongoose = require('mongoose')
const CONFIG = require('./src/utils/config')
const server = require('./src/server')

const { user, pw, mongoDBURI } = CONFIG

// connect to mongoDB cloud
mongoose.connect(
  mongoDBURI(user, pw),
  {
    useNewUrlParser: true,
  }
)

server.listen().then(({ url }) => console.log(`server running on ${url}`))
