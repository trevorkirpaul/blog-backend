const mongoose = require('mongoose')

const { Schema, model } = mongoose

const commentSchema = new Schema({
  body: {
    type: String,
    require: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    require: true,
  },
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'comment',
  },
  childComments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'comment',
    },
  ],
  parentPost: {
    type: Schema.Types.ObjectId,
    ref: 'post',
  },
  userLikes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
  userDisLikes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
})

const Model = model('comment', commentSchema)

module.exports = Model
