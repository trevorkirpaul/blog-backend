const { ApolloServer } = require('apollo-server')

const resolvers = require('./resolvers')
const typeDefs = require('./schema')

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

module.exports = server
