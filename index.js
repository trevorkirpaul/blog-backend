const { ApolloServer } = require('apollo-server')
const mongoose = require('mongoose')
const CONFIG = require('./config')
const resolvers = require('./data/resolvers')
const typeDefs = require('./data/typeDefs')

const { user, pw, mongoDBURI } = CONFIG

// connect to mongoDB cloud
mongoose.connect(
  mongoDBURI(user, pw),
  {
    useNewUrlParser: true,
  }
)

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => console.log(`server running on ${url}`))
