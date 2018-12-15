const { ApolloServer, gql } = require('apollo-server')
const mongoose = require('mongoose')
const CONFIG = require('./config')
const User = require('./models/user')
const Post = require('./models/post')
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

  type Post {
    id: ID
    title: String
    body: String
    author: User
    userLikes: [User]
    userDisLikes: [User]
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

  type PostResponse {
    message: String
    error: Boolean
  }

  type Query {
    users: [User]
    posts: [Post]
  }

  type Mutation {
    createUser(email: String, password: String): User
    login(email: String, password: String): Response
    validate(token: String): ValidateResponse
    createPost(title: String, body: String, author: ID): Post
    updatePost(title: String, body: String, postID: ID): Post
    deletePost(postID: ID): PostResponse
    likePost(postID: ID, authorID: ID): Post
    disLikePost(postID: ID, authorID: ID): Post
    clearLikeAndDisLike(postID: ID, authorID: ID): Post
  }
`

const resolvers = {
  Query: {
    users: () => {
      return User.find()
        .then(res => res)
        .catch(err => err)
    },

    posts: () => {
      return Post.find()
        .populate('author')
        .populate('userLikes')
        .populate('userDisLikes')
        .then(res => res)
        .catch(err => err)
    },
  },

  Mutation: {
    // posts
    createPost(root, args, context, info) {
      const { title, body, author } = args
      return Post.create({ title, body, author }).then(post => post)
    },

    updatePost(root, args, context, info) {
      const { postID, title, body } = args

      return Post.findByIdAndUpdate(
        postID,
        { $set: { title, body } },
        { new: true }
      ).then(post => post)
    },

    deletePost(root, args, context, info) {
      const { postID } = args

      return Post.findByIdAndDelete(postID)
        .then(() => ({
          message: 'successfully deleted post',
          error: false,
        }))
        .catch(() => ({
          message: 'failed to delete post',
          error: true,
        }))
    },

    likePost(root, { postID, authorID, context, info }) {
      return Post.findByIdAndUpdate(
        postID,
        {
          $addToSet: { userLikes: authorID },
          $pull: { userDisLikes: authorID },
        },
        { new: true }
      )
        .populate('userLikes')
        .populate('userDisLikes')
        .then(post => post)
    },

    disLikePost(root, { postID, authorID }, context, info) {
      return Post.findByIdAndUpdate(
        postID,
        {
          $addToSet: { userDisLikes: authorID },
          $pull: { userLikes: authorID },
        },
        { new: true }
      )
        .populate('userLikes')
        .populate('userDisLikes')
        .then(post => post)
    },

    clearLikeAndDisLike(root, { postID, authorID }, context, info) {
      return Post.findByIdAndUpdate(
        postID,
        {
          $pull: { userDisLikes: authorID, userLikes: authorID },
        },
        { new: true }
      )
        .populate('userLikes')
        .populate('userDisLikes')
        .then(post => post)
    },

    // user
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
