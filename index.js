const { ApolloServer, gql } = require('apollo-server')
const mongoose = require('mongoose')
const CONFIG = require('./config')
const User = require('./models/user')
const bcrypt = require('bcrypt')
const jwt = require('jwt-simple')

const { user, pw, mongoDBURI, secret } = CONFIG

// connect to mongoDB cloud
mongoose.connect(
  mongoDBURI(user, pw),
  {
    useNewUrlParser: true,
  }
)

const typeDefs = gql`
  type User {
    id: ID
    email: String
    password: String
  }

  type Response {
    message: String
    success: Boolean
    error: Boolean
    token: String
  }

  type ValidateResponse {
    validated: Boolean
  }

  type Query {
    users: [User]
  }

  type Mutation {
    createUser(email: String, password: String): User
    login(email: String, password: String): Response
    validate(token: String): ValidateResponse
  }
`

const resolvers = {
  Query: {
    users: () => {
      return User.find()
        .then(res => res)
        .catch(err => err)
    },
  },

  Mutation: {
    createUser(root, args, context, info) {
      const { email, password } = args
      return User.create({ email, password }).then(user => user)
    },

    login: async (root, { password, email }, context, info) => {
      try {
        const $user = await User.findOne({ email })

        if (!$user) {
          return {
            message: 'user not found',
            error: true,
            success: false,
            token: null,
          }
        }

        const validPassword = await bcrypt.compare(password, $user.password)

        if (validPassword) {
          return {
            message: 'successfully signed in',
            error: false,
            success: true,
            token: jwt.encode({ userID: $user._id }, secret),
          }
        }

        return {
          message: 'invalid creds',
          error: true,
          success: false,
          token: null,
        }
      } catch (error) {
        return {
          message: 'server error, see server console',
          token: null,
          hasError: true,
          token: null,
        }
      }
    },

    validate: (root, { token }, context, info) => {
      try {
        const decodedToken = jwt.decode(token, secret)

        return User.findById(decodedToken.userID).then(user => {
          if (user) {
            return {
              validated: true,
            }
          }

          return {
            validated: false,
          }
        })
      } catch (error) {
        return {
          validated: false,
        }
      }
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => console.log(`server running on ${url}`))
