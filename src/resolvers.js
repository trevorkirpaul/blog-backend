const bcrypt = require('bcrypt')
const jwt = require('jwt-simple')
const axios = require('axios')

const User = require('./models/user')
const Post = require('./models/post')
const Comment = require('./models/comment')
const CONFIG = require('./utils/config')

const { secret } = CONFIG

const resolvers = {
  Query: {
    articles: () => {
      return axios.get('http://localhost:1337/articles').then(({ data }) => {
        const articles = data.map(a => ({
          id: a._id,
          title: a.title,
          content: a.content,
        }))
        return articles
      })
    },

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
        .populate('childComments')
        .then(res => res)
        .catch(err => err)
    },

    comments: () => {
      return Comment.find()
        .populate('author')
        .populate('parentComment')
        .populate('parentPost')
        .populate('userLikes')
        .populate('userDisLikes')
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
        .then(post => post)
        .catch(err => console.log(err))
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

    /*
      Comment
    */

    createComment(root, args, context, info) {
      const { body, authorID, parentCommentID, parentPostID } = args

      return Comment.create({
        body,
        author: authorID,
        parentComment: parentCommentID,
        parentPost: parentPostID,
      }).then(comment => {
        /*
          If there was a parentPostID then
          we'll have to find and update the Post's
          childComments property

          If there was a parentCommentID
          that means this comment was for
          another comment, so we'll have
          to find and update that comment
        */

        if (parentPostID) {
          Post.findByIdAndUpdate(parentPostID, {
            $push: { childComments: comment._id },
          }).then(() => {})
        }

        if (parentCommentID) {
          Comment.findByIdAndUpdate(parentCommentID, {
            $push: { childComments: comment._id },
          }).then(() => {})
        }

        return {
          message: 'successfully created comment',
          error: false,
          comment,
        }
      })
    },

    likeComment(root, { commentID, authorID }, context, info) {
      return Comment.findByIdAndUpdate(
        commentID,
        {
          $addToSet: { userLikes: authorID },
          $pull: { userDisLikes: authorID },
        },
        { new: true }
      ).then(comment => ({
        message: 'successfully liked comment',
        error: false,
        comment,
      }))
    },

    dislikeComment(root, { commentID, authorID }, context, info) {
      return Comment.findByIdAndUpdate(
        commentID,
        {
          $addToSet: { userDisLikes: authorID },
          $pull: { userLikes: authorID },
        },
        { new: true }
      ).then(comment => ({
        message: 'successfully disliked comment',
        error: false,
        comment,
      }))
    },

    clearLikeAndDislikeComment(root, { commentID, authorID }, context, info) {
      return Comment.findByIdAndUpdate(
        commentID,
        {
          $pull: { userLikes: authorID, userDisLikes: authorID },
        },
        { new: true }
      ).then(comment => ({
        message: 'successfully removed like and dislike from comment',
        error: false,
        comment,
      }))
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

module.exports = resolvers
