const mongoose = require('mongoose')

const { Schema, model } = mongoose

const postSchema = new Schema({
  title: {
    type: String,
    require: true,
  },
  body: {
    type: String,
    require: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    require: true,
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

const Model = model('post', postSchema)

module.exports = Model
